import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { execSync } from "child_process";
import { SERVICE_PORTS } from "7-shared";

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
  const app = await NestFactory.create(AppModule);
  
  // Global prefix for REST API
  app.setGlobalPrefix("api");
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  
  // Global exception filter (Rule #10 - Observability)
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global logging interceptor (Rule #10 - Observability)
  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>("app.port", SERVICE_PORTS.GATEWAY);

  // Free the port before attempting to listen (handles ts-node-dev respawns)
  await freePort(port);

  try {
  await app.listen(port);
  console.log(`Gateway is running on port ${port}`);
  console.log(`REST API: http://localhost:${port}/api`);
  console.log(`GraphQL: http://localhost:${port}/graphql`);
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
}

bootstrap().catch((error) => {
  console.error("Failed to start Gateway:", error);
  process.exit(1);
});
