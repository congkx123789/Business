import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { SocialGateway } from "../gateways/social.gateway";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type SocialJobData = {
  id: string;
  userId: string;
  content?: string;
  createdAt?: string | number;
};

@Processor("social-events")
@Injectable()
export class SocialEventsWorker {
  private readonly logger = new Logger(SocialEventsWorker.name);

  constructor(private readonly socialGateway: SocialGateway) {}

  @Process(EVENT_BUS_TOPICS.POST_CREATED)
  async handlePostCreated(job: Job<SocialJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting post.created (${payload.id})`);
    this.socialGateway.emitFeedUpdate(payload);
  }

  @Process(EVENT_BUS_TOPICS.POST_LIKED)
  async handlePostLiked(job: Job<SocialJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting post.liked (${payload.id})`);
    this.socialGateway.emitPostLiked(payload);
  }
}


