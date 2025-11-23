import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "USERS_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "users",
            protoPath: join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "users.proto"),
            url: configService.get<string>("USERS_SERVICE_GRPC_URL", "localhost:50051"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class UsersClientModule {}

