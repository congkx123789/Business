import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "MONETIZATION_SERVICE",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const grpcUrl = configService.get<string>("MONETIZATION_SERVICE_GRPC_URL", "0.0.0.0:50060");
          const protoPath = join(
            process.cwd(),
            "packages",
            "7-shared",
            "src",
            "proto",
            "monetization.proto"
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: "monetization",
              protoPath: protoPath,
              url: grpcUrl,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MonetizationClientModule {}

