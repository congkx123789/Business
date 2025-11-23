import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { SocialProducer } from "../events/social.producer";

@Processor("social-events")
@Injectable()
export class SocialEventsWorker {
  private readonly logger = new Logger(SocialEventsWorker.name);

  constructor(private readonly socialProducer: SocialProducer) {}

  // This worker can be used to process incoming social events if needed
  // Currently, social-service primarily emits events rather than consuming them
  // But this structure is here for future extensibility

  @Process("process-social-event")
  async handleSocialEvent(job: Job) {
    this.logger.log(`Processing social event: ${job.id}`);
    // Future: Process incoming social events if needed
  }
}
