import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "STORIES_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "stories",
            protoPath: join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "stories.proto"),
            url: configService.get<string>("STORIES_SERVICE_GRPC_URL", "localhost:50052"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class StoriesClientModule {}

