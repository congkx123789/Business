import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { GRPC_PORTS, SERVICE_PORTS } from "7-shared";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Connect gRPC microservice
  const grpcUrl = configService.get<string>(
    "app.grpcUrl",
    `0.0.0.0:${GRPC_PORTS.STORIES_SERVICE}`
  );
  // Calculate absolute path to proto file (works in both dev and production)
  // __dirname in dev: packages/2-services/stories-service/src
  // __dirname in prod: packages/2-services/stories-service/dist
  // Both need to go up 3 levels to reach packages/, then down to 7-shared
  const protoPath = join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "stories.proto");
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: "stories",
      protoPath: protoPath,
      url: grpcUrl,
    },
  });

  await app.startAllMicroservices();
  const port = configService.get<number>(
    "app.port",
    SERVICE_PORTS.STORIES_SERVICE
  );
  await app.listen(port);
  console.log(`Stories Service is running on port ${port}`);
  console.log(`Stories Service gRPC is running on ${grpcUrl}`);
  console.log(`Stories Service is emitting events to Event Bus`);
}

bootstrap().catch((error) => {
  console.error("Failed to start Stories Service:", error);
  process.exit(1);
});
