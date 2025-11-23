import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { MONETIZATION_EVENTS } from "7-shared";
import { NotificationService } from "../modules/notification/notification.service";

interface MonetizationPayload {
  email?: string;
  pushTokens?: string[];
  username?: string;
  storyTitle?: string;
  chaptersUnlocked?: number;
  amount?: number;
  currency?: string;
  vipLevel?: string;
  balance?: number;
  status?: string;
  membershipName?: string;
}

@Processor("monetization-events")
@Injectable()
export class MonetizationEventsWorker {
  private readonly logger = new Logger(MonetizationEventsWorker.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(MONETIZATION_EVENTS.PURCHASE_COMPLETED)
  async handlePurchaseCompleted(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("purchase.completed event missing email");
      return;
    }

    await this.notificationService.sendTemplateEmail({
      to: payload.email,
      template: "purchase-confirmation",
      variables: {
        username: payload.username ?? "Reader",
        storyTitle: payload.storyTitle ?? "your story",
        chaptersUnlocked: payload.chaptersUnlocked ?? 1,
      },
    });

    if (payload.pushTokens?.length) {
      await this.notificationService.sendTemplatePush({
        tokens: payload.pushTokens,
        template: "purchase-confirmation",
        variables: {
          storyTitle: payload.storyTitle ?? "your story",
          chaptersUnlocked: payload.chaptersUnlocked ?? 1,
        },
      });
    }
  }

  @Process(MONETIZATION_EVENTS.SUBSCRIPTION_RENEWED)
  async handleSubscriptionRenewed(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("subscription.renewed event missing email");
      return;
    }

    await this.notificationService.sendTemplateEmail({
      to: payload.email,
      template: "subscription-renewal",
      variables: {
        username: payload.username ?? "Reader",
        amount: payload.amount ?? 0,
        currency: payload.currency ?? "coins",
      },
    });

    if (payload.pushTokens?.length) {
      await this.notificationService.sendTemplatePush({
        tokens: payload.pushTokens,
        template: "subscription-renewal",
        variables: {
          amount: payload.amount ?? 0,
          currency: payload.currency ?? "coins",
        },
      });
    }
  }

  @Process(MONETIZATION_EVENTS.VIP_LEVEL_UPGRADED)
  async handleVipUpgrade(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("vip.level.upgraded event missing email");
      return;
    }

    await this.notificationService.sendTemplateEmail({
      to: payload.email,
      template: "vip-upgrade",
      variables: {
        username: payload.username ?? "Reader",
        vipLevel: payload.vipLevel ?? "",
      },
    });

    if (payload.pushTokens?.length) {
      await this.notificationService.sendTemplatePush({
        tokens: payload.pushTokens,
        template: "vip-upgrade",
        variables: {
          vipLevel: payload.vipLevel ?? "",
        },
      });
    }
  }

  @Process(MONETIZATION_EVENTS.PRIVILEGE_PURCHASED)
  async handlePrivilegePurchased(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("privilege.purchased event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "Privilege unlocked",
      html: `<p>You can now access advanced chapters for ${
        payload.storyTitle ?? "your story"
      }.</p>`,
    });
  }

  @Process(MONETIZATION_EVENTS.WALLET_BALANCE_LOW)
  async handleLowBalance(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("wallet.balance.low event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "Your wallet balance is running low",
      html: `<p>Your remaining balance is ${
        payload.balance ?? 0
      } coins. Top up now to avoid interruptions.</p>`,
    });
  }

  @Process(MONETIZATION_EVENTS.SUBSCRIPTION_CANCELLED)
  async handleSubscriptionCancelled(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("subscription.cancelled event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "We're sorry to see you go",
      html: `<p>Your subscription has been cancelled. You can resubscribe anytime from the wallet screen.</p>`,
    });
  }

  @Process(MONETIZATION_EVENTS.WALLET_BALANCE_UPDATED)
  async handleBalanceUpdated(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("wallet.balance.updated event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "Wallet balance updated",
      html: `<p>Your wallet balance is now ${payload.balance ?? 0} coins.</p>`,
    });
  }

  @Process(MONETIZATION_EVENTS.SUBSCRIPTION_STATUS_CHANGED)
  async handleSubscriptionStatusChanged(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("subscription.status.changed event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "Subscription status updated",
      html: `<p>Your subscription status changed to ${
        payload.status ?? "updated"
      }. Visit your wallet for details.</p>`,
    });
  }

  @Process(MONETIZATION_EVENTS.MEMBERSHIP_RENEWED)
  async handleMembershipRenewed(job: Job<MonetizationPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("membership.renewed event missing email");
      return;
    }

    await this.notificationService.sendEmail({
      to: payload.email,
      subject: "Membership renewed",
      html: `<p>Your ${
        payload.membershipName ?? "membership"
      } just renewed successfully.</p>`,
    });
  }
}


