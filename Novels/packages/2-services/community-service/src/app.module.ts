import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, databaseConfig } from "./config/configuration";
import { DatabaseModule } from "./common/database/database.module";
import { FanEconomyModule } from "./modules/fan-economy/fan-economy.module";
import { CommunityController } from "./controllers/community.controller";
import { InteractionsModule } from "./modules/interactions/interactions.module";
import { QueueModule } from "./common/queue/queue.module";
import { CommunityEventsWorker } from "./workers/community-events.worker";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    QueueModule,
    InteractionsModule,
    FanEconomyModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityEventsWorker],
})
export class AppModule {}

