import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "AI_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: "ai",
            protoPath: join(__dirname, "..", "..", "..", "7-shared", "src", "proto", "ai.proto"),
            url: configService.get<string>("AI_SERVICE_GRPC_URL", "localhost:50056"),
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class AIClientModule {}




























