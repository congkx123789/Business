import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { PrismaModule } from "./prisma/prisma.module";
import { SocialController } from "./controllers/social.controller";
import { CacheModule } from "./common/cache/cache.module";
import { EventsModule } from "./events/events.module";
import { PostsModule } from "./modules/posts/posts.module";
import { GroupsModule } from "./modules/groups/groups.module";
import { FollowsModule } from "./modules/follows/follows.module";
import { FeedModule } from "./modules/feed/feed.module";
import { ReadingChallengesModule } from "./modules/reading-challenges/reading-challenges.module";
import { ActivityTrackingModule } from "./modules/activity-tracking/activity-tracking.module";
import { SocialEventsWorker } from "./workers/social-events.worker";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    PrismaModule,
    CacheModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
        },
      }),
    }),
    EventsModule,
    PostsModule,
    GroupsModule,
    FollowsModule,
    FeedModule,
    ActivityTrackingModule,
    ReadingChallengesModule,
  ],
  controllers: [SocialController],
  providers: [SocialEventsWorker],
})
export class AppModule {}

