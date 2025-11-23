import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { SOCIAL_EVENTS } from "7-shared";
import { NotificationService } from "../modules/notification/notification.service";

interface SocialEventPayload {
  followerName?: string;
  followerId?: string;
  targetEmail?: string;
  targetPushTokens?: string[];
  postTitle?: string;
  groupName?: string;
}

@Processor("social-events")
@Injectable()
export class SocialEventsWorker {
  private readonly logger = new Logger(SocialEventsWorker.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(SOCIAL_EVENTS.USER_FOLLOWED)
  async handleUserFollowed(job: Job<SocialEventPayload>) {
    const payload = job.data ?? {};
    if (!payload.targetEmail && !payload.targetPushTokens?.length) {
      this.logger.warn("user.followed event missing recipients");
      return;
    }

    const followerName = payload.followerName ?? "A reader";
    const body = `<p>${followerName} just followed you. Jump back in and say hi!</p>`;

    if (payload.targetEmail) {
      await this.notificationService.sendEmail({
        to: payload.targetEmail,
        subject: `${followerName} is now following you`,
        html: body,
      });
    }

    if (payload.targetPushTokens?.length) {
      await this.notificationService.sendPush({
        tokens: payload.targetPushTokens,
        title: "New follower",
        body: `${followerName} just followed you`,
        data: {
          type: SOCIAL_EVENTS.USER_FOLLOWED,
          followerId: payload.followerId ?? "",
        },
      });
    }
  }

  @Process(SOCIAL_EVENTS.POST_LIKED)
  async handlePostLiked(job: Job<SocialEventPayload>) {
    const payload = job.data ?? {};
    if (!payload.targetPushTokens?.length) {
      this.logger.debug("post.liked event without push tokens skipped");
      return;
    }

    await this.notificationService.sendPush({
      tokens: payload.targetPushTokens,
      title: "Someone liked your post",
      body: `Your post${payload.postTitle ? ` "${payload.postTitle}"` : ""} is getting love`,
      data: {
        type: SOCIAL_EVENTS.POST_LIKED,
        postTitle: payload.postTitle ?? "",
      },
    });
  }

  @Process(SOCIAL_EVENTS.POST_CREATED_IN_GROUP)
  async handleGroupPost(job: Job<SocialEventPayload>) {
    const payload = job.data ?? {};
    if (!payload.targetPushTokens?.length) {
      this.logger.debug("group post event without push tokens skipped");
      return;
    }

    await this.notificationService.sendPush({
      tokens: payload.targetPushTokens,
      title: `New post in ${payload.groupName ?? "your group"}`,
      body: `Catch up with the latest discussion now.`,
      data: {
        type: SOCIAL_EVENTS.POST_CREATED_IN_GROUP,
        groupName: payload.groupName ?? "",
      },
    });
  }
}


