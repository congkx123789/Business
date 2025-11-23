import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { StoriesClientService } from "./stories-client.service";

export const STORIES_GRPC_CLIENT = "STORIES_GRPC_CLIENT";

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: STORIES_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "stories",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "stories.proto"
            ),
            url: configService.get<string>("services.storiesGrpcUrl", "0.0.0.0:50052"),
          },
        }),
      },
    ]),
  ],
  providers: [StoriesClientService],
  exports: [StoriesClientService],
})
export class StoriesClientModule {}


