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
    `0.0.0.0:${GRPC_PORTS.COMMUNITY_SERVICE}`
  );
  const protoPath = join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "definitions", "community.proto");
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: "community",
      protoPath: protoPath,
      url: grpcUrl,
    },
  });

  await app.startAllMicroservices();
  const port = configService.get<number>(
    "app.port",
    SERVICE_PORTS.COMMUNITY_SERVICE
  );
  await app.listen(port);
  console.log(`Community Service is running on port ${port}`);
  console.log(`Community Service gRPC is running on ${grpcUrl}`);
}

bootstrap().catch((error) => {
  console.error("Failed to start Community Service:", error);
  process.exit(1);
});

