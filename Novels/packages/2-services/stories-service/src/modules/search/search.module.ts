import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { SearchIntegrationService } from "./search.service";

export const SEARCH_GRPC_CLIENT = "SEARCH_GRPC_CLIENT";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SEARCH_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "search",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "search.proto"
            ),
            url: configService.get<string>("SEARCH_SERVICE_GRPC_URL", "0.0.0.0:50054"),
          },
        }),
      },
    ]),
  ],
  providers: [SearchIntegrationService],
  exports: [SearchIntegrationService],
})
export class SearchModule {}


