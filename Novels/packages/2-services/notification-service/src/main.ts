import { existsSync } from "fs";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { GRPC_PORTS, SERVICE_PORTS } from "7-shared";

const PROTO_RELATIVE_PATH = [
  "src",
  "proto",
  "definitions",
  "notification.proto",
] as const;

function resolveProtoPath() {
  const candidateBases = [
    // ts-node / start:dev (packages/2-services/notification-service/src -> packages/7-shared)
    join(__dirname, "..", "..", "..", "7-shared"),
    // Compiled build (dist/src -> packages/7-shared)
    join(__dirname, "..", "..", "..", "..", "7-shared"),
    // When process cwd is the service directory
    join(process.cwd(), "..", "..", "7-shared"),
    // Fallback to workspace-installed dependency (node_modules/7-shared)
    join(process.cwd(), "node_modules", "7-shared"),
  ];

  for (const base of candidateBases) {
    const candidate = join(base, ...PROTO_RELATIVE_PATH);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "notification.proto not found. Ensure 7-shared is installed and linked."
  );
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn", "log"],
    });
    const configService = app.get(ConfigService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    const grpcUrl = configService.get<string>(
      "app.grpcUrl",
      `0.0.0.0:${GRPC_PORTS.NOTIFICATION_SERVICE}`
    );
    const protoPath = resolveProtoPath();

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: "notification",
        protoPath,
        url: grpcUrl,
      },
    });

    await app.startAllMicroservices();

    const port = configService.get<number>(
      "app.port",
      SERVICE_PORTS.NOTIFICATION_SERVICE
    );
    await app.listen(port);
    console.log(`✓ Notification Service is running on port ${port}`);
    console.log(`✓ Notification Service gRPC is running on ${grpcUrl}`);
    console.log(
      "✓ Notification Service is listening to Event Bus for notifications"
    );
  } catch (error) {
    console.error("Failed to start Notification Service:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
