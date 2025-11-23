import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CommunityEventsService } from "./community-events.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("COMMUNITY_SERVICE_REDIS_HOST", "localhost"),
          port: configService.get<number>("COMMUNITY_SERVICE_REDIS_PORT", 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: "community-events",
    }),
  ],
  providers: [CommunityEventsService],
  exports: [BullModule, CommunityEventsService],
})
export class QueueModule {}


