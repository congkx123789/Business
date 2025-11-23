import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/users-service-client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const datasourceUrl =
      configService.get<string>("database.url") ?? process.env.USERS_SERVICE_DATABASE_URL;
    const logLevels = configService.get<Prisma.LogLevel[]>("database.logLevels") ?? ["error"];

    super({
      datasources: {
        db: {
          url: datasourceUrl,
        },
      },
      log: logLevels,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
