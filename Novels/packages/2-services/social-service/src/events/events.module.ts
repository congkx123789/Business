import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { SocialProducer } from "./social.producer";
import { SocialEventsWorker } from "../workers/social-events.worker";

@Module({
  imports: [BullModule.registerQueue({ name: "social-events" })],
  providers: [SocialProducer, SocialEventsWorker],
  exports: [SocialProducer],
})
export class EventsModule {}


