import { Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

const COMMENT_QUEUE = "comment-events";

@Processor(COMMENT_QUEUE)
export class CommentEventsWorker {
  private readonly logger = new Logger(CommentEventsWorker.name);

  @Process()
  async handleEvent(job: Job) {
    this.logger.log(
      `Forwarding ${job.name} via comment-events queue: ${JSON.stringify(job.data)}`
    );
  }
}


