import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CommentEventsService } from "./comment-events.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("COMMENTS_SERVICE_REDIS_HOST", "localhost"),
          port: configService.get<number>("COMMENTS_SERVICE_REDIS_PORT", 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: "comment-events",
    }),
  ],
  providers: [CommentEventsService],
  exports: [BullModule, CommentEventsService],
})
export class QueueModule {}


