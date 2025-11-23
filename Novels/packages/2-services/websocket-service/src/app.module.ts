import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/configuration";
import { QueueModule } from "./common/queue/queue.module";
import { AppGateway } from "./gateways/app.gateway";
import { CommentsGateway } from "./gateways/comments.gateway";
import { NotificationsGateway } from "./gateways/notifications.gateway";
import { SocialGateway } from "./gateways/social.gateway";
import { MonetizationGateway } from "./gateways/monetization.gateway";
import { CommunityGateway } from "./gateways/community.gateway";
import { CommentEventsWorker } from "./workers/comment-events.worker";
import { NotificationEventsWorker } from "./workers/notification-events.worker";
import { SocialEventsWorker } from "./workers/social-events.worker";
import { GroupEventsWorker } from "./workers/group-events.worker";
import { MonetizationEventsWorker } from "./workers/monetization-events.worker";
import { CommunityEventsWorker } from "./workers/community-events.worker";
import { WebsocketController } from "./controllers/websocket.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig],
    }),
    QueueModule, // Event Bus listener (BullModule.forRootAsync is inside QueueModule)
  ],
  controllers: [WebsocketController],
  providers: [
    AppGateway,
    CommentsGateway,
    NotificationsGateway,
    SocialGateway,
    MonetizationGateway,
    CommunityGateway,
    CommentEventsWorker,
    NotificationEventsWorker,
    SocialEventsWorker,
    GroupEventsWorker,
    MonetizationEventsWorker,
    CommunityEventsWorker,
  ],
})
export class AppModule {}

