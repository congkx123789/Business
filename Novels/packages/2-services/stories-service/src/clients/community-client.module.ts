import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";

export const COMMUNITY_GRPC_CLIENT = "COMMUNITY_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: COMMUNITY_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "community",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "community.proto"
            ),
            url: configService.get<string>("COMMUNITY_SERVICE_GRPC_URL", "0.0.0.0:50059"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class CommunityClientModule {}

