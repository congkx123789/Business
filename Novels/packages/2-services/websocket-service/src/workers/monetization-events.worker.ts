import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { MonetizationGateway } from "../gateways/monetization.gateway";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type WalletJobData = {
  userId: string;
  balance: number;
  currency?: string;
  updatedAt?: string | number;
};

type PurchaseJobData = {
  userId: string;
  storyId?: string;
  chapterId?: string;
  chapterIds?: string[];
  totalPrice?: number;
  balanceAfter?: number;
  success?: boolean;
};

type SubscriptionJobData = {
  userId: string;
  status: string;
  tier?: string;
  renewedAt?: string | number;
};

type VipJobData = {
  userId: string;
  level: number;
  achievedAt?: string | number;
};

@Processor("monetization-events")
@Injectable()
export class MonetizationEventsWorker {
  private readonly logger = new Logger(MonetizationEventsWorker.name);

  constructor(private readonly monetizationGateway: MonetizationGateway) {}

  @Process(EVENT_BUS_TOPICS.WALLET_BALANCE_UPDATED)
  async handleWalletBalance(job: Job<WalletJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting wallet.balance.updated (${payload.userId})`);
    this.monetizationGateway.emitWalletUpdate({
      userId: payload.userId,
      balance: payload.balance,
      currency: payload.currency,
      updatedAt: payload.updatedAt,
    });
  }

  @Process(EVENT_BUS_TOPICS.PURCHASE_COMPLETED)
  async handlePurchaseCompleted(job: Job<PurchaseJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting purchase.completed (${payload.userId})`);
    this.monetizationGateway.emitPurchaseCompleted({
      ...payload,
      success: payload.success ?? true,
    });
  }

  @Process(EVENT_BUS_TOPICS.SUBSCRIPTION_STATUS_CHANGED)
  async handleSubscriptionStatus(job: Job<SubscriptionJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting subscription.status.changed (${payload.userId})`);
    this.monetizationGateway.emitSubscriptionStatus(payload);
  }

  @Process(EVENT_BUS_TOPICS.VIP_LEVEL_UPGRADED)
  async handleVipUpgrade(job: Job<VipJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting vip.level.upgraded (${payload.userId})`);
    this.monetizationGateway.emitVipUpgrade(payload);
  }
}


