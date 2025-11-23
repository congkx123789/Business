import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";

export const MONETIZATION_GRPC_CLIENT = "MONETIZATION_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MONETIZATION_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "monetization",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "monetization.proto"
            ),
            url: configService.get<string>("MONETIZATION_SERVICE_GRPC_URL", "0.0.0.0:50060"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MonetizationClientModule {}

