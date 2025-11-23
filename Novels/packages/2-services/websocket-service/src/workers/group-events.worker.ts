import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { SocialGateway } from "../gateways/social.gateway";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type GroupJobData = {
  id: string;
  userId: string;
  groupId: string;
  content?: string;
  createdAt?: string | number;
};

type FollowJobData = {
  followerId: string;
  followingId: string;
  timestamp?: string | number;
};

@Processor("group-events")
@Injectable()
export class GroupEventsWorker {
  private readonly logger = new Logger(GroupEventsWorker.name);

  constructor(private readonly socialGateway: SocialGateway) {}

  @Process(EVENT_BUS_TOPICS.POST_CREATED_IN_GROUP)
  async handleGroupPost(job: Job<GroupJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting post.created.in.group (${payload.id})`);
    this.socialGateway.emitGroupPost(payload);
  }

  @Process(EVENT_BUS_TOPICS.USER_FOLLOWED)
  async handleUserFollowed(job: Job<FollowJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting user.followed (${payload.followerId})`);
    this.socialGateway.emitFollowerUpdate(payload);
  }

  @Process(EVENT_BUS_TOPICS.GROUP_MEMBER_JOINED)
  async handleGroupMemberJoined(job: Job<GroupJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting group.member.joined (${payload.userId})`);
    this.socialGateway.emitGroupPost({
      ...payload,
      content: `${payload.userId} joined the group`,
    });
  }
}


