import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "COMMUNITY_SERVICE",
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const grpcUrl = configService.get<string>("COMMUNITY_SERVICE_GRPC_URL", "0.0.0.0:50059");
          const protoPath = join(
            process.cwd(),
            "packages",
            "7-shared",
            "src",
            "proto",
            "definitions",
            "community.proto"
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: "community",
              protoPath: protoPath,
              url: grpcUrl,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class CommunityClientModule {}

