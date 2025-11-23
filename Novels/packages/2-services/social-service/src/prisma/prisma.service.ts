import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/social-service-client";
import { INFRASTRUCTURE_PORTS } from "7-shared";

const DEFAULT_SOCIAL_DB_URL = `postgresql://novels_user:novels_password@localhost:${INFRASTRUCTURE_PORTS.POSTGRESQL}/novels_db?schema=social_service`;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? DEFAULT_SOCIAL_DB_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

