import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";

export const USERS_GRPC_CLIENT = "USERS_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USERS_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "users",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "users.proto"
            ),
            url: configService.get<string>("USERS_SERVICE_GRPC_URL", "0.0.0.0:50051"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class UsersClientModule {}

