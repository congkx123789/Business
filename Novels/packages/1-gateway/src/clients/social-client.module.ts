import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "SOCIAL_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "social",
            protoPath: join(
              __dirname,
              "..",
              "..",
              "..",
              "7-shared",
              "src",
              "proto",
              "definitions",
              "social.proto",
            ),
            url: configService.get<string>(
              "SOCIAL_SERVICE_GRPC_URL",
              "localhost:3008",
            ),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class SocialClientModule {}

