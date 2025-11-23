import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "WEBSOCKET_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "websocket",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "websocket.proto"
            ),
            url: configService.get<string>("WEBSOCKET_SERVICE_GRPC_URL", "localhost:50057"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class WebSocketClientModule {}

