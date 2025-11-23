import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>("WEBSOCKET_SERVICE_REDIS_HOST", "localhost");
        const redisPort = configService.get<number>("WEBSOCKET_SERVICE_REDIS_PORT", 6379);
        console.log(`[WebSocket Service] Connecting to Redis at ${redisHost}:${redisPort}`);
        return {
          redis: {
            host: redisHost,
            port: redisPort,
          },
        };
      },
    }),
    // Register queues for Event Bus listeners
    BullModule.registerQueue(
      { name: "comment-events" },
      { name: "notification-events" },
      { name: "social-events" },
      { name: "group-events" },
      { name: "community-events" },
      { name: "monetization-events" }
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}

