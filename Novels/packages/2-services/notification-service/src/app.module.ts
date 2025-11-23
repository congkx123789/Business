import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  appConfig,
  emailConfig,
  pushConfig,
  smsConfig,
  redisConfig,
} from "./config/configuration";
import { QueueModule } from "./common/queue/queue.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { NotificationController } from "./controllers/notification.controller";
import { UserEventsWorker } from "./workers/user-events.worker";
import { CommentEventsWorker } from "./workers/comment-events.worker";
import { SocialEventsWorker } from "./workers/social-events.worker";
import { GroupEventsWorker } from "./workers/group-events.worker";
import { MonetizationEventsWorker } from "./workers/monetization-events.worker";
import { CommunityEventsWorker } from "./workers/community-events.worker";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, emailConfig, pushConfig, smsConfig, redisConfig],
    }),
    QueueModule, // Event Bus listener
    NotificationModule,
  ],
  controllers: [NotificationController],
  providers: [
    UserEventsWorker,
    CommentEventsWorker,
    SocialEventsWorker,
    GroupEventsWorker,
    MonetizationEventsWorker,
    CommunityEventsWorker,
  ],
})
export class AppModule {}

