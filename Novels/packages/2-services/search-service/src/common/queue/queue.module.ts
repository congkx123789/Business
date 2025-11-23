import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("SEARCH_SERVICE_REDIS_HOST", "localhost"),
          port: configService.get<number>("SEARCH_SERVICE_REDIS_PORT", 6379),
        },
      }),
    }),
    BullModule.registerQueue({ name: "story-events" }),
    BullModule.registerQueue({ name: "social-events" }),
  ],
  exports: [BullModule],
})
export class QueueModule {}

