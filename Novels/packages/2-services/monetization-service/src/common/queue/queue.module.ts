import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MonetizationEventsService } from "./monetization-events.service";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("MONETIZATION_SERVICE_REDIS_HOST", "localhost"),
          port: configService.get<number>("MONETIZATION_SERVICE_REDIS_PORT", 6379),
        },
      }),
    }),
    // Register queues for events
    BullModule.registerQueue(
      { name: "wallet-events" },
      { name: "purchase-events" },
      { name: "subscription-events" },
      { name: "vip-events" }
    ),
  ],
  providers: [MonetizationEventsService],
  exports: [BullModule, MonetizationEventsService],
})
export class QueueModule {}

