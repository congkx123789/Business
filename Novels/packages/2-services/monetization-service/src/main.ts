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
    `0.0.0.0:${GRPC_PORTS.MONETIZATION_SERVICE}`
  );
  const protoPath = join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "definitions", "monetization.proto");
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: "monetization",
      protoPath: protoPath,
      url: grpcUrl,
    },
  });

  await app.startAllMicroservices();
  const port = configService.get<number>(
    "app.port",
    SERVICE_PORTS.MONETIZATION_SERVICE
  );
  await app.listen(port);
  console.log(`Monetization Service is running on port ${port}`);
  console.log(`Monetization Service gRPC is running on ${grpcUrl}`);
}

bootstrap().catch((error) => {
  console.error("Failed to start Monetization Service:", error);
  process.exit(1);
});

