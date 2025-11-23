import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "SEARCH_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "search",
            protoPath: join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "search.proto"),
            url: configService.get<string>("SEARCH_SERVICE_GRPC_URL", "localhost:50054"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SearchClientModule {}

