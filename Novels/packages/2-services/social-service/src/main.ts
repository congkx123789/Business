import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { AppModule } from "./app.module";
import { GRPC_PORTS } from "7-shared";

async function bootstrap() {
  const grpcUrl =
    process.env.SOCIAL_SERVICE_GRPC_URL ??
    `0.0.0.0:${GRPC_PORTS.SOCIAL_SERVICE}`;
  const protoPath = join(
    __dirname,
    "..",
    "..",
    "..",
    "7-shared",
    "src",
    "proto",
    "definitions",
    "social.proto",
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: "social",
        protoPath,
        url: grpcUrl,
      },
    },
  );

  await app.listen();
  console.log(`✓ Social Service is running (gRPC on ${grpcUrl})`);
}

bootstrap().catch((error) => {
  console.error("Failed to start Social Service:", error);
  process.exit(1);
});

