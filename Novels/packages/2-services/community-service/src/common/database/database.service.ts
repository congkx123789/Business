import { INestApplication, Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/community-service-client";
import { ConfigType } from "@nestjs/config";
import { databaseConfig } from "../../config/configuration";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>
  ) {
    super({
      datasources: {
        db: {
          url: dbConfig.url,
        },
      },
      log: dbConfig.logQueries ? ["query", "info", "warn", "error"] : ["warn", "error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on("beforeExit", async () => {
      await app.close();
    });
  }
}

