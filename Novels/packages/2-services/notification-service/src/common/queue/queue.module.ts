import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";

const EVENT_QUEUES = [
  "user-events",
  "comment-events",
  "social-events",
  "group-events",
  "monetization-events",
  "community-events",
] as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get("redis") as {
          host: string;
          port: number;
          password?: string;
        };
        const host = redisConfig?.host ?? "localhost";
        const port = redisConfig?.port ?? 6379;
        console.log(
          `[Notification Service] Connecting to Redis at ${host}:${port}`
        );
        return {
          redis: {
            host,
            port,
            password: redisConfig?.password,
          },
        };
      },
    }),
    BullModule.registerQueue(...EVENT_QUEUES.map((name) => ({ name }))),
  ],
  exports: [BullModule],
})
export class QueueModule {}

