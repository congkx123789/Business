import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StoryEventsService } from "./story-events.service";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("STORIES_SERVICE_REDIS_HOST", "localhost"),
          port: configService.get<number>("STORIES_SERVICE_REDIS_PORT", 6379),
        },
      }),
    }),
    // Register queues for events
    BullModule.registerQueue(
      { name: "story-events" },
      { name: "chapter-events" },
      { name: "ranking-calculation" }
    ),
  ],
  providers: [StoryEventsService],
  exports: [BullModule, StoryEventsService],
})
export class QueueModule {}

