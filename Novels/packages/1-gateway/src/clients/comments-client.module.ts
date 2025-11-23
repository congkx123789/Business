import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "COMMENTS_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "comments",
            protoPath: join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "comments.proto"),
            url: configService.get<string>("COMMENTS_SERVICE_GRPC_URL", "localhost:50053"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class CommentsClientModule {}

