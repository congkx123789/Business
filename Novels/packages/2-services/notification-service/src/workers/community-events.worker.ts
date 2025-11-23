import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { COMMUNITY_EVENTS } from "7-shared";
import { NotificationService } from "../modules/notification/notification.service";

interface CommunityPayload {
  email?: string;
  pushTokens?: string[];
  username?: string;
  tipAmount?: number;
  currency?: string;
  milestone?: string;
  rankingPosition?: number;
}

@Processor("community-events")
@Injectable()
export class CommunityEventsWorker {
  private readonly logger = new Logger(CommunityEventsWorker.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(COMMUNITY_EVENTS.TIP_RECEIVED)
  async handleTipReceived(job: Job<CommunityPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("tip.received event missing email");
      return;
    }

    await this.notificationService.sendTemplateEmail({
      to: payload.email,
      template: "tipping-received",
      variables: {
        username: payload.username ?? "Creator",
        tipAmount: payload.tipAmount ?? 0,
        currency: payload.currency ?? "coins",
      },
    });

    if (payload.pushTokens?.length) {
      await this.notificationService.sendTemplatePush({
        tokens: payload.pushTokens,
        template: "tipping-received",
        variables: {
          tipAmount: payload.tipAmount ?? 0,
          currency: payload.currency ?? "coins",
        },
      });
    }
  }

  @Process(COMMUNITY_EVENTS.VOTE_MILESTONE)
  async handleVoteMilestone(job: Job<CommunityPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("vote.milestone event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "You reached a new vote milestone",
      html: `<p>Congrats! You just unlocked the ${payload.milestone ?? ""} milestone.</p>`,
    });
  }

  @Process(COMMUNITY_EVENTS.FAN_RANKING_UPDATED)
  async handleFanRanking(job: Job<CommunityPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("fan.ranking.updated event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "Your fan ranking changed",
      html: `<p>You're now ranked #${
        payload.rankingPosition ?? "-"
      } in the fan leaderboard. Keep going!</p>`,
    });
  }
}


