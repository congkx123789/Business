import { Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

const COMMUNITY_QUEUE = "community-events";

@Processor(COMMUNITY_QUEUE)
export class CommunityEventsWorker {
  private readonly logger = new Logger(CommunityEventsWorker.name);

  @Process()
  async handle(job: Job) {
    this.logger.log(`Forwarding ${job.name} event: ${JSON.stringify(job.data)}`);
  }
}


