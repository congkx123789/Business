import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { SOCIAL_EVENTS } from "7-shared";
import { NotificationService } from "../modules/notification/notification.service";

interface GroupEventPayload {
  email?: string;
  pushTokens?: string[];
  groupName?: string;
  inviterName?: string;
}

@Processor("group-events")
@Injectable()
export class GroupEventsWorker {
  private readonly logger = new Logger(GroupEventsWorker.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(SOCIAL_EVENTS.GROUP_INVITE)
  async handleGroupInvite(job: Job<GroupEventPayload>) {
    const payload = job.data ?? {};
    if (!payload.email && !payload.pushTokens?.length) {
      this.logger.warn("group.invite event missing recipients");
      return;
    }

    const inviter = payload.inviterName ?? "A reader";
    const group = payload.groupName ?? "a group";
    const html = `<p>${inviter} invited you to join ${group}. Jump back in to accept the invite.</p>`;

    if (payload.email) {
      await this.notificationService.sendEmail({
        to: payload.email,
        subject: `Invitation to join ${group}`,
        html,
      });
    }

    if (payload.pushTokens?.length) {
      await this.notificationService.sendPush({
        tokens: payload.pushTokens,
        title: `Invitation to ${group}`,
        body: `${inviter} invited you to join ${group}`,
        data: {
          type: SOCIAL_EVENTS.GROUP_INVITE,
        },
      });
    }
  }

  @Process(SOCIAL_EVENTS.GROUP_MEMBER_JOINED)
  async handleGroupMemberJoined(job: Job<GroupEventPayload>) {
    const payload = job.data ?? {};
    if (!payload.pushTokens?.length) {
      this.logger.debug("group.member.joined event without push tokens skipped");
      return;
    }

    await this.notificationService.sendPush({
      tokens: payload.pushTokens,
      title: `${payload.inviterName ?? "A member"} joined ${payload.groupName ?? "your group"}`,
      body: "Say hello and keep the conversation going.",
      data: {
        type: SOCIAL_EVENTS.GROUP_MEMBER_JOINED,
      },
    });
  }
}


