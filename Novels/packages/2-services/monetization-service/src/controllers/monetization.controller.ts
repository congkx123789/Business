import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { PrivilegeService } from "../modules/privilege/privilege.service";
import { PricingService } from "../modules/pricing/pricing.service";
import { PaywallService } from "../modules/paywall/paywall.service";
import {
  TransactionRecord,
  WalletSnapshot,
} from "../modules/virtual-currency/wallet.service";
import { VirtualCurrencyService } from "../modules/virtual-currency/virtual-currency.service";
import { PaymentsService } from "../modules/payments/payments.service";
import { PurchaseRecord } from "../modules/payments/purchase.service";
import { SubscriptionsService } from "../modules/subscriptions/subscriptions.service";
import { AllYouCanReadService } from "../modules/subscriptions/all-you-can-read/all-you-can-read.service";
import { LoyaltyProgramService } from "../modules/subscriptions/loyalty-program/loyalty-program.service";
import { AccessDecision } from "../modules/paywall/dto/check-access.dto";
import { PaywallConfigDto } from "../modules/paywall/dto/paywall-config.dto";
import { MembershipRecord } from "../modules/subscriptions/dto/create-membership.dto";
import { SubscriptionRecord } from "../modules/subscriptions/dto/subscription.dto";
import { VipHistoryEntry, VipLevel } from "../modules/subscriptions/dto/vip-level.dto";
import { ReceiptDto } from "../modules/payments/dto/receipt.dto";

@Controller()
export class MonetizationController {
  constructor(
    private readonly virtualCurrencyService: VirtualCurrencyService,
    private readonly paymentsService: PaymentsService,
    private readonly privilegeService: PrivilegeService,
    private readonly pricingService: PricingService,
    private readonly paywallService: PaywallService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly allYouCanReadService: AllYouCanReadService,
    private readonly loyaltyProgramService: LoyaltyProgramService
  ) {}

  private toEpoch(value?: string | number | null) {
    if (!value) {
      return 0;
    }
    if (typeof value === "number") {
      return value;
    }
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private mapWallet(wallet: WalletSnapshot) {
    return {
      userId: wallet.userId,
      balance: Math.trunc(wallet.balance),
      currency: wallet.currency,
      updatedAt: this.toEpoch(wallet.updatedAt),
    };
  }

  private mapTransaction(record: TransactionRecord) {
    return {
      id: record.id,
      userId: record.userId,
      type: record.type,
      amount: Math.trunc(record.amount),
      balanceAfter: Math.trunc(record.balanceAfter),
      referenceId: record.referenceId ?? "",
      createdAt: this.toEpoch(record.createdAt),
    };
  }

  private mapPurchase(record: PurchaseRecord) {
    return {
      id: record.id,
      userId: record.userId,
      storyId: record.storyId,
      chapterIds: record.chapterIds,
      totalPrice: Math.trunc(record.totalPrice),
      balanceAfter: Math.trunc(record.balanceAfter),
      status: record.status,
      createdAt: this.toEpoch(record.createdAt),
    };
  }

  private mapReceipt(receipt: ReceiptDto) {
    return {
      purchaseId: receipt.purchaseId,
      userId: receipt.userId,
      storyId: receipt.storyId,
      chapterIds: receipt.chapterIds,
      totalPrice: Math.trunc(receipt.totalPrice),
      balanceBefore: Math.trunc(receipt.balanceBefore),
      balanceAfter: Math.trunc(receipt.balanceAfter),
      createdAt: this.toEpoch(receipt.issuedAt),
      receiptNumber: receipt.receiptNumber,
      paymentMethod: receipt.paymentMethod,
    };
  }

  private mapPaywallConfig(config: PaywallConfigDto) {
    return {
      storyId: config.storyId,
      freeChapters: config.freeChapters,
      enabled: config.enabled,
      previewLength: config.previewLength,
      updatedAt: this.toEpoch(config.updatedAt),
    };
  }

  private mapAccess(decision: AccessDecision) {
    return {
      hasAccess: decision.hasAccess,
      reason: decision.reason,
      price: decision.price ?? 0,
      purchaseId: "",
      expiresAt: decision.expiresAt ? this.toEpoch(decision.expiresAt) : 0,
    };
  }

  private mapMembership(membership: MembershipRecord) {
    return {
      id: membership.id,
      userId: membership.userId,
      planId: membership.planId,
      status: membership.status,
      startDate: this.toEpoch(membership.startDate),
      endDate: this.toEpoch(membership.endDate),
      autoRenew: membership.autoRenew,
      coinsGranted: membership.coinsGranted,
      dailyBonus: membership.dailyBonus,
      lastDailyBonusClaim: membership.lastDailyBonusClaim
        ? this.toEpoch(membership.lastDailyBonusClaim)
        : 0,
    };
  }

  private mapSubscription(subscription: SubscriptionRecord) {
    return {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      startDate: this.toEpoch(subscription.startDate),
      endDate: this.toEpoch(subscription.endDate),
      autoRenew: subscription.autoRenew,
    };
  }

  private mapVipLevel(level: VipLevel) {
    return {
      level: level.level,
      name: level.name,
      minSpending: level.minSpending,
      discountPercent: level.discountPercent,
      monthlyVotes: level.monthlyVotes,
      benefits: level.benefits,
    };
  }

  private mapVipHistory(entry: VipHistoryEntry) {
    return {
      id: entry.id,
      userId: entry.userId,
      level: entry.level,
      levelName: entry.levelName,
      totalSpending: entry.totalSpending,
      achievedAt: this.toEpoch(entry.achievedAt),
    };
  }

  // Virtual Currency --------------------------------------------------------
  @GrpcMethod("MonetizationService", "GetWallet")
  async getWallet({ userId }: { userId: string }) {
    const wallet = await this.virtualCurrencyService.getWallet(userId);
    return { success: true, data: this.mapWallet(wallet), message: "Wallet retrieved" };
  }

  @GrpcMethod("MonetizationService", "TopUp")
  async topUp(data: {
    userId: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
  }) {
    const result = await this.virtualCurrencyService.topUp(data);
    return {
      success: result.success,
      transactionId: result.transactionId ?? "",
      newBalance: Math.trunc(result.wallet.balance),
      message: result.message,
    };
  }

  @GrpcMethod("MonetizationService", "DeductPoints")
  async deductPoints(data: {
    userId: string;
    amount: number;
    referenceId: string;
    description?: string;
  }) {
    const result = await this.virtualCurrencyService.deductPoints(data);
    return {
      success: result.success,
      data: this.mapWallet(result.wallet),
      message: result.message,
    };
  }

  @GrpcMethod("MonetizationService", "RefundPoints")
  async refundPoints(data: {
    userId: string;
    amount: number;
    referenceId: string;
    description?: string;
  }) {
    const result = await this.virtualCurrencyService.refundPoints(data);
    return {
      success: result.success,
      data: this.mapWallet(result.wallet),
      message: result.message,
    };
  }

  @GrpcMethod("MonetizationService", "GetTransactionHistory")
  async getTransactionHistory(data: { userId: string; page?: number; limit?: number }) {
    const history = await this.virtualCurrencyService.getTransactionHistory(data);
    return {
      success: true,
      data: history.data.map((record) => this.mapTransaction(record)),
      total: history.total,
      message: "Transaction history retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "GetBalance")
  async getBalance({ userId }: { userId: string }) {
    const balance = await this.virtualCurrencyService.getBalance(userId);
    return {
      success: true,
      balance: Math.trunc(balance.balance),
      currency: balance.currency,
      updatedAt: this.toEpoch(balance.updatedAt),
      cached: balance.cached,
      message: "Balance retrieved",
    };
  }

  // Pricing ------------------------------------------------------------------
  @GrpcMethod("MonetizationService", "CalculateChapterPrice")
  async calculateChapterPrice(data: {
    chapterId: string;
    storyId?: string;
    characterCount?: number;
  }) {
    const price = await this.pricingService.calculateChapterPrice(data);
    return {
      success: true,
      data: {
        chapterId: price.chapterId,
        characterCount: price.characterCount,
        price: price.price,
        pointsPerThousandChars: price.pointsPerThousandChars,
      },
      message: "Price calculated",
    };
  }

  @GrpcMethod("MonetizationService", "CalculateBulkPrice")
  async calculateBulkPrice(data: { chapterIds: string[]; storyId?: string }) {
    const result = await this.pricingService.calculateBulkPrice(data.chapterIds, data.storyId);
    return {
      success: true,
      totalPrice: result.totalPrice,
      breakdown: result.breakdown.map((item) => ({
        chapterId: item.chapterId,
        characterCount: item.characterCount,
        price: item.price,
        pointsPerThousandChars: item.pointsPerThousandChars,
      })),
      message: "Bulk price calculated",
    };
  }

  @GrpcMethod("MonetizationService", "GetPricingRules")
  async getPricingRules(data: { storyId?: string }) {
    const rules = await this.pricingService.getPricingRules(data.storyId);
    return {
      success: true,
      data: rules.map((rule) => ({
        storyId: rule.storyId ?? "",
        pointsPerThousandChars: rule.pointsPerThousandChars,
        minPrice: rule.minPrice,
        maxPrice: rule.maxPrice,
        updatedAt: this.toEpoch(rule.updatedAt),
      })),
      message: "Pricing rules retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "UpdatePricingRule")
  async updatePricingRule(data: {
    storyId?: string;
    pointsPerThousandChars: number;
    minPrice?: number;
    maxPrice?: number;
    discountPercent?: number;
  }) {
    const rule = await this.pricingService.updatePricingRule(data);
    return {
      success: true,
      data: {
        storyId: rule.storyId ?? "",
        pointsPerThousandChars: rule.pointsPerThousandChars,
        minPrice: rule.minPrice,
        maxPrice: rule.maxPrice,
        updatedAt: this.toEpoch(rule.updatedAt),
      },
      message: "Pricing rule updated",
    };
  }

  // Paywall ------------------------------------------------------------------
  @GrpcMethod("MonetizationService", "CheckChapterAccess")
  async checkChapterAccess(data: {
    userId: string;
    chapterId: string;
    storyId: string;
    chapterNumber?: number;
  }) {
    const result = await this.paywallService.checkChapterAccess(data);
    return { success: true, data: this.mapAccess(result), message: "Access evaluated" };
  }

  @GrpcMethod("MonetizationService", "GetPaywallConfig")
  async getPaywallConfig(data: { storyId: string }) {
    const config = await this.paywallService.getPaywallConfig(data.storyId);
    return { success: true, data: this.mapPaywallConfig(config), message: "Config retrieved" };
  }

  @GrpcMethod("MonetizationService", "UpdatePaywallConfig")
  async updatePaywallConfig(data: {
    storyId: string;
    freeChapters: number;
    enabled: boolean;
    previewLength?: number;
  }) {
    const config = await this.paywallService.updatePaywallConfig(data);
    return { success: true, data: this.mapPaywallConfig(config), message: "Config updated" };
  }

  // Payment Processing -------------------------------------------------------
  @GrpcMethod("MonetizationService", "PurchaseChapter")
  async purchaseChapter(data: {
    userId: string;
    chapterId: string;
    storyId: string;
    idempotencyKey?: string;
  }) {
    const result = await this.paymentsService.purchaseChapter(data);
    return {
      success: result.success,
      data: this.mapPurchase(result.data),
      message: result.message,
    };
  }

  @GrpcMethod("MonetizationService", "PurchaseBulk")
  async purchaseBulk(data: {
    userId: string;
    chapterIds: string[];
    storyId: string;
    idempotencyKey?: string;
  }) {
    const result = await this.paymentsService.purchaseBulk(data);
    return {
      success: result.success,
      data: this.mapPurchase(result.data),
      message: result.message,
    };
  }

  @GrpcMethod("MonetizationService", "GetPurchaseHistory")
  async getPurchaseHistory(data: { userId: string; storyId?: string; page?: number; limit?: number }) {
    const history = await this.paymentsService.getPurchaseHistory(data);
    return {
      success: history.success,
      data: history.data.map((record: PurchaseRecord) => this.mapPurchase(record)),
      total: history.total,
      message: history.message,
    };
  }

  @GrpcMethod("MonetizationService", "GetPurchaseReceipt")
  async getPurchaseReceipt(data: { purchaseId: string; paymentMethod?: string }) {
    const receipt = await this.paymentsService.getPurchaseReceipt(
      data.purchaseId,
      data.paymentMethod
    );
    if (!receipt.success || !receipt.data) {
      return { success: false, message: receipt.message ?? "Receipt not found" };
    }

    return {
      success: true,
      data: this.mapReceipt(receipt.data),
      message: receipt.message,
    };
  }

  @GrpcMethod("MonetizationService", "RefundPurchase")
  async refundPurchase(data: { purchaseId: string; reason: string }) {
    const result = await this.paymentsService.refundPurchase(data.purchaseId, data.reason);
    if (!result.success || !result.data) {
      return { success: false, message: result.message ?? "Refund failed" };
    }

    return {
      success: true,
      data: this.mapPurchase(result.data),
      message: result.message,
    };
  }

  // Privilege (Advanced Chapters) -------------------------------------------
  @GrpcMethod("MonetizationService", "GetPrivilegeStatus")
  async getPrivilegeStatus(data: { userId: string; storyId: string }) {
    const status = await this.privilegeService.getPrivilegeStatus(data);
    return {
      success: true,
      data: {
        userId: status.data.userId,
        storyId: status.data.storyId,
        hasPrivilege: status.data.hasPrivilege ?? true,
        purchaseDate: this.toEpoch(status.data.purchaseDate),
        expiresAt: this.toEpoch(status.data.expiresAt),
        price: status.data.price,
      },
      message: "Privilege status retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "PurchasePrivilege")
  async purchasePrivilege(data: {
    userId: string;
    storyId: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }) {
    const result = await this.privilegeService.purchasePrivilege(data);
    return {
      success: true,
      data: {
        userId: result.data.userId,
        storyId: result.data.storyId,
        hasPrivilege: true,
        purchaseDate: this.toEpoch(result.data.purchaseDate),
        expiresAt: this.toEpoch(result.data.expiresAt),
        price: result.data.price,
      },
      message: "Privilege purchased",
    };
  }

  @GrpcMethod("MonetizationService", "GetAdvancedChapters")
  async getAdvancedChapters(data: { storyId: string; userId?: string }) {
    const result = await this.privilegeService.getAdvancedChapters(data);
    return {
      success: true,
      data: result.data.map((chapter, index) => ({
        chapterId: chapter.chapterId,
        title: `Advanced Chapter ${index + 1}`,
        order: index + 1,
        price: 25,
        purchased: false,
        releaseDate: Date.now(),
      })),
      message: "Advanced chapters retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "PurchaseAdvancedChapter")
  async purchaseAdvancedChapter(data: {
    userId: string;
    chapterId: string;
    storyId: string;
    idempotencyKey?: string;
  }) {
    const result = await this.privilegeService.purchaseAdvancedChapter(data);
    return {
      success: true,
      data: {
        id: result.data.id,
        userId: result.data.userId,
        storyId: result.data.storyId,
        chapterIds: [result.data.chapterId],
        totalPrice: result.data.price,
        balanceAfter: Math.trunc(result.data.balanceAfter),
        status: "completed",
        createdAt: this.toEpoch(result.data.purchasedAt),
      },
      message: "Advanced chapter purchased",
    };
  }

  // Memberships --------------------------------------------------------------
  @GrpcMethod("MonetizationService", "CreateMembership")
  async createMembership(data: {
    userId: string;
    planId: string;
    coinsGranted: number;
    dailyBonus: number;
    billingPeriod: "monthly" | "yearly";
    autoRenew?: boolean;
  }) {
    const membership = await this.subscriptionsService.createMembership(data);
    return {
      success: true,
      data: this.mapMembership(membership),
      message: "Membership created",
    };
  }

  @GrpcMethod("MonetizationService", "GetMembership")
  async getMembership(data: { userId: string }) {
    const membership = await this.subscriptionsService.getMembership(data.userId);
    if (!membership) {
      return { success: false, message: "Membership not found" };
    }
    return { success: true, data: this.mapMembership(membership), message: "Membership retrieved" };
  }

  @GrpcMethod("MonetizationService", "CancelMembership")
  async cancelMembership(data: { userId: string }) {
    const membership = await this.subscriptionsService.cancelMembership(data.userId);
    if (!membership) {
      return { success: false, message: "Membership not found" };
    }
    return { success: true, data: this.mapMembership(membership), message: "Membership cancelled" };
  }

  @GrpcMethod("MonetizationService", "ClaimDailyBonus")
  async claimDailyBonus(data: { userId: string }) {
    try {
      const result = await this.subscriptionsService.claimDailyBonus({ userId: data.userId });
      return {
        success: result.claimed,
        bonusAmount: result.amount,
        newBalance: result.newBalance ?? 0,
        message: result.claimed ? "Bonus claimed" : "Already claimed today",
      };
    } catch (error) {
      return { success: false, bonusAmount: 0, newBalance: 0, message: (error as Error).message };
    }
  }

  // Subscriptions ------------------------------------------------------------
  @GrpcMethod("MonetizationService", "CreateSubscription")
  async createSubscription(data: { userId: string; planId: string; autoRenew?: boolean }) {
    try {
      const subscription = await this.allYouCanReadService.createSubscription(
        data.userId,
        data.planId,
        data.autoRenew
      );
      return {
        success: true,
        data: this.mapSubscription(subscription),
        message: "Subscription created",
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message ?? "Subscription creation failed",
      };
    }
  }

  @GrpcMethod("MonetizationService", "GetSubscription")
  async getSubscription(data: { userId: string }) {
    const subscription = await this.allYouCanReadService.getSubscription(data.userId);
    if (!subscription) {
      return { success: false, message: "Subscription not found" };
    }
    return {
      success: true,
      data: this.mapSubscription(subscription),
      message: "Subscription retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "CancelSubscription")
  async cancelSubscription(data: { userId: string }) {
    const subscription = await this.allYouCanReadService.cancelSubscription(data.userId);
    if (!subscription) {
      return { success: false, message: "Subscription not found" };
    }
    return {
      success: true,
      data: this.mapSubscription(subscription),
      message: "Subscription cancelled",
    };
  }

  // VIP / Loyalty ------------------------------------------------------------
  @GrpcMethod("MonetizationService", "GetVIPLevel")
  async getVipLevel(data: { userId: string }) {
    const snapshot = this.loyaltyProgramService.getVipLevel(data.userId);
    return {
      success: true,
      currentLevel: this.mapVipLevel(snapshot.currentLevel),
      totalSpending: snapshot.totalSpending,
      message: "VIP level retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "GetVIPLevels")
  async getVipLevels() {
    const levels = this.loyaltyProgramService.listVipLevels();
    return {
      success: true,
      data: levels.map((level) => this.mapVipLevel(level)),
      message: "VIP levels retrieved",
    };
  }

  @GrpcMethod("MonetizationService", "RecordSpending")
  async recordSpending(data: { userId: string; amount: number }) {
    const snapshot = this.loyaltyProgramService.recordSpending(data.userId, data.amount);
    return {
      success: true,
      newLevel: this.mapVipLevel(snapshot.currentLevel),
      totalSpending: snapshot.totalSpending,
      message: "Spending recorded",
    };
  }

  @GrpcMethod("MonetizationService", "GetVIPHistory")
  async getVipHistory(data: { userId: string; page?: number; limit?: number }) {
    const history = this.loyaltyProgramService.getVipHistory(
      data.userId,
      data.page,
      data.limit
    );
    return {
      success: true,
      data: history.data.map((entry) => this.mapVipHistory(entry)),
      total: history.total,
      page: history.page,
      limit: history.limit,
      message: "VIP history retrieved",
    };
  }
}

