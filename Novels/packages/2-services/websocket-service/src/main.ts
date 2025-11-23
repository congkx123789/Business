import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { execSync } from "child_process";
import { join } from "path";
import { GRPC_PORTS, SERVICE_PORTS } from "7-shared";

async function freePort(port: number): Promise<void> {
  try {
    // Only get LISTENING connections to avoid TIME_WAIT and other states
    const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf-8' });
    
    if (result.trim()) {
      const lines = result.trim().split('\n');
      const pids = new Set<string>();
      
      lines.forEach(line => {
        // Match PID at the end of the line (after LISTENING)
        const match = line.match(/LISTENING\s+(\d+)\s*$/);
        if (match && match[1] && match[1] !== '0') {
          pids.add(match[1]);
        }
      });
      
      pids.forEach(pid => {
        try {
          console.log(`[Port Check] Killing process ${pid} using port ${port}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch (error) {
          // Process might already be gone, ignore
        }
      });
      
      // Wait for port to be released
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    // No processes found, port is free - this is fine
  }
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

    // Enable CORS for WebSocket connections
    app.enableCors({
      origin: '*',
      credentials: true,
    });

    // Attach gRPC microservice for direct broadcasts (gateway -> websocket-service)
    const grpcUrl = configService.get<string>(
      "app.grpcUrl",
      `0.0.0.0:${GRPC_PORTS.WEBSOCKET_SERVICE}`
    );
    const protoPath = join(
      __dirname,
      "..",
      "..",
      "..",
      "7-shared",
      "src",
      "proto",
      "definitions",
      "websocket.proto"
    );
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: "websocket",
        protoPath,
        url: grpcUrl,
      },
    });

    const port = configService.get<number>(
      "app.port",
      SERVICE_PORTS.WEBSOCKET_SERVICE
    );
    
    // Free the port before attempting to listen (handles ts-node-dev respawns)
    await freePort(port);
    
    await app.startAllMicroservices();

    try {
      await app.listen(port);
      console.log(`✓ WebSocket Service is running on port ${port}`);
      console.log(`✓ WebSocket Service is listening to Event Bus for real-time updates`);
      console.log(`✓ WebSocket endpoint: ws://localhost:${port}`);
      console.log(`✓ WebSocket gRPC endpoint: ${grpcUrl}`);
    } catch (listenError: any) {
      if (listenError?.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use.`);
        console.error(`   Please stop the process using port ${port} or change the port in your configuration.`);
        console.error(`   On Windows, you can find the process with: netstat -ano | findstr :${port}`);
        console.error(`   Then kill it with: taskkill /F /PID <PID>`);
      } else {
        throw listenError;
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("Failed to start WebSocket Service:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.stack && !error.message.includes('EADDRINUSE')) {
      console.error("Stack:", error.stack);
      }
    }
  process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error("Failed to start WebSocket Service:", error);
  process.exit(1);
});
