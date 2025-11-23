import { Injectable, Logger } from "@nestjs/common";
import { AppGateway } from "./app.gateway";

interface WalletPayload {
  userId: string;
  balance: number;
  currency?: string;
  updatedAt?: string | number;
}

interface PurchasePayload {
  userId: string;
  storyId?: string;
  chapterId?: string;
  chapterIds?: string[];
  success: boolean;
  totalPrice?: number;
  balanceAfter?: number;
  createdAt?: string | number;
}

interface SubscriptionPayload {
  userId: string;
  status: string;
  tier?: string;
  renewedAt?: string | number;
}

interface VipPayload {
  userId: string;
  level: number;
  achievedAt?: string | number;
}

@Injectable()
export class MonetizationGateway {
  private readonly logger = new Logger(MonetizationGateway.name);

  constructor(private readonly appGateway: AppGateway) {}

  emitWalletUpdate(payload: WalletPayload) {
    const room = this.buildWalletRoom(payload.userId);
    this.logger.debug(`Emitting wallet.balance.updated to ${room}`);
    this.appGateway.emitToRoom(room, "wallet.balance.updated", {
      userId: payload.userId,
      balance: payload.balance,
      currency: payload.currency ?? "points",
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    });
  }

  emitPurchaseCompleted(payload: PurchasePayload) {
    const room = this.buildWalletRoom(payload.userId);
    this.logger.debug(`Emitting purchase.completed to ${room}`);
    this.appGateway.emitToRoom(room, "purchase.completed", {
      userId: payload.userId,
      storyId: payload.storyId,
      chapterId: payload.chapterId,
      chapterIds: payload.chapterIds,
      success: payload.success,
      totalPrice: payload.totalPrice,
      balanceAfter: payload.balanceAfter,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitSubscriptionStatus(payload: SubscriptionPayload) {
    const room = this.buildWalletRoom(payload.userId);
    this.logger.debug(`Emitting subscription.status.changed to ${room}`);
    this.appGateway.emitToRoom(room, "subscription.status.changed", {
      userId: payload.userId,
      status: payload.status,
      tier: payload.tier,
      renewedAt: payload.renewedAt ?? new Date().toISOString(),
    });
  }

  emitVipUpgrade(payload: VipPayload) {
    const room = this.buildWalletRoom(payload.userId);
    this.logger.debug(`Emitting vip.level.upgraded to ${room}`);
    this.appGateway.emitToRoom(room, "vip.level.upgraded", {
      userId: payload.userId,
      level: payload.level,
      achievedAt: payload.achievedAt ?? new Date().toISOString(),
    });
  }

  private buildWalletRoom(userId?: string) {
    return userId ? `wallet:${userId}` : undefined;
  }
}


