import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { MonetizationEventsService } from "../../common/queue/monetization-events.service";
import { PurchaseChapterDto } from "./dto/purchase-chapter.dto";
import { PurchaseBulkDto } from "./dto/purchase-bulk.dto";
import { PurchaseHistoryQueryDto } from "./dto/purchase-history-query.dto";
import { PaywallService } from "../paywall/paywall.service";
import { PricingService } from "../pricing/pricing.service";
import { VirtualCurrencyService } from "../virtual-currency/virtual-currency.service";
import { DeductPointsDto } from "../virtual-currency/dto/deduct-points.dto";
import { PurchaseStatus } from "@prisma/monetization-service-client";

export interface PurchaseRecord {
  id: string;
  userId: string;
  storyId: string;
  chapterIds: string[];
  totalPrice: number;
  status: "completed" | "refunded";
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
  paymentMethod: string;
  refundedAt?: string;
  refundReason?: string;
}

@Injectable()
export class PurchaseService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsService: MonetizationEventsService,
    private readonly paywallService: PaywallService,
    private readonly pricingService: PricingService,
    private readonly virtualCurrencyService: VirtualCurrencyService
  ) {}

  async purchaseChapter(request: PurchaseChapterDto): Promise<PurchaseRecord> {
    // Check idempotency - Rule #12
    const idempotencyKey = request.idempotencyKey ?? `${request.userId}:${request.chapterId}`;
    
    // Check if already purchased (idempotent check)
    const existingPurchase = await this.databaseService.purchase.findUnique({
      where: {
        userId_chapterId: {
          userId: request.userId,
          chapterId: request.chapterId,
        },
      },
    });

    if (existingPurchase && existingPurchase.status === PurchaseStatus.COMPLETED) {
      return this.mapPurchaseToRecord(existingPurchase);
    }

    // Check access
    const access = await this.paywallService.checkChapterAccess(request);
    if (access.hasAccess) {
      return this.recordZeroPricePurchase(request.userId, request.storyId, [request.chapterId]);
    }

    // Calculate price
    const pricing = await this.pricingService.calculateChapterPrice({
      chapterId: request.chapterId,
      storyId: request.storyId,
    });

    // Get wallet balance before deduction
    const balanceResult = await this.virtualCurrencyService.getBalance({ userId: request.userId });
    const balanceBefore = balanceResult.balance;

    // Deduct points
    const deduction: DeductPointsDto = {
      userId: request.userId,
      amount: pricing.price,
      referenceId: idempotencyKey,
      description: `Purchase chapter ${request.chapterId}`,
    };

    const deductionResult = await this.virtualCurrencyService.deductPoints(deduction);
    if (!deductionResult.success) {
      // Emit failed event
      await this.eventsService.emitPurchaseFailed({
        userId: request.userId,
        chapterId: request.chapterId,
        reason: "INSUFFICIENT_FUNDS",
      });
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // Use database transaction for atomicity
    const purchase = await this.databaseService.$transaction(async (tx) => {
      // Create purchase record
      const purchaseRecord = await tx.purchase.upsert({
        where: {
          userId_chapterId: {
            userId: request.userId,
            chapterId: request.chapterId,
          },
        },
        create: {
          userId: request.userId,
          chapterId: request.chapterId,
          storyId: request.storyId,
          price: pricing.price,
          characterCount: pricing.characterCount,
          status: PurchaseStatus.COMPLETED,
          paymentId: deductionResult.transactionId,
          balanceBefore: balanceBefore,
          paymentMethod: "wallet",
        },
        update: {
          status: PurchaseStatus.COMPLETED,
          paymentId: deductionResult.transactionId,
        },
      });

      // Grant access
      await this.paywallService.grantAccess({
        userId: request.userId,
        chapterId: request.chapterId,
        storyId: request.storyId,
        reason: "purchased",
      });

      return purchaseRecord;
    });

    // Emit purchase completed event
    await this.eventsService.emitPurchaseCompleted({
      userId: request.userId,
      purchaseId: purchase.id,
      chapterId: request.chapterId,
      storyId: request.storyId,
      price: Number(purchase.price),
    });

    return this.mapPurchaseToRecord(purchase);
  }

  async purchaseBulk(request: PurchaseBulkDto): Promise<PurchaseRecord> {
    const idempotencyKey = request.idempotencyKey ?? `${request.userId}:${request.chapterIds.join(",")}`;

    // Check which chapters need purchase
    const chaptersToPurchase = [];
    for (const chapterId of request.chapterIds) {
      const access = await this.paywallService.checkChapterAccess({
        userId: request.userId,
        storyId: request.storyId,
        chapterId,
      });
      if (!access.hasAccess) {
        chaptersToPurchase.push(chapterId);
      }
    }

    if (!chaptersToPurchase.length) {
      return this.recordZeroPricePurchase(request.userId, request.storyId, request.chapterIds);
    }

    // Calculate bulk price
    const { totalPrice } = await this.pricingService.calculateBulkPrice(
      chaptersToPurchase,
      request.storyId
    );

    // Get wallet balance before deduction
    const balanceResult = await this.virtualCurrencyService.getBalance({ userId: request.userId });
    const balanceBefore = balanceResult.balance;

    // Deduct points
    const deduction = await this.virtualCurrencyService.deductPoints({
      userId: request.userId,
      amount: totalPrice,
      referenceId: idempotencyKey,
      description: `Bulk purchase (${chaptersToPurchase.length} chapters)`,
    });

    if (!deduction.success) {
      await this.eventsService.emitPurchaseFailed({
        userId: request.userId,
        chapterId: chaptersToPurchase[0],
        reason: "INSUFFICIENT_FUNDS",
      });
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // Use database transaction
    const bulkPurchase = await this.databaseService.$transaction(async (tx) => {
      // Create bulk purchase record
      const bulkRecord = await tx.bulkPurchase.create({
        data: {
          userId: request.userId,
          storyId: request.storyId,
          chapterIds: chaptersToPurchase,
          totalPrice: totalPrice,
          discountApplied: 0,
          status: PurchaseStatus.COMPLETED,
          paymentId: deduction.transactionId,
        },
      });

      // Create individual purchase records for each chapter
      await Promise.all(
        chaptersToPurchase.map((chapterId) =>
          tx.purchase.upsert({
            where: {
              userId_chapterId: {
                userId: request.userId,
                chapterId,
              },
            },
            create: {
              userId: request.userId,
              chapterId,
              storyId: request.storyId,
              price: totalPrice / chaptersToPurchase.length, // Split price evenly
              characterCount: 0, // Will be updated from pricing service
              status: PurchaseStatus.COMPLETED,
              paymentId: deduction.transactionId,
              balanceBefore: balanceBefore,
              paymentMethod: "wallet",
            },
            update: {
              status: PurchaseStatus.COMPLETED,
            },
          })
        )
      );

      // Grant access to all chapters
      await Promise.all(
        chaptersToPurchase.map((chapterId) =>
          this.paywallService.grantAccess({
            userId: request.userId,
            chapterId,
            storyId: request.storyId,
            reason: "purchased",
          })
        )
      );

      return bulkRecord;
    });

    // Emit events for each chapter
    await Promise.all(
      chaptersToPurchase.map((chapterId) =>
        this.eventsService.emitPurchaseCompleted({
          userId: request.userId,
          purchaseId: bulkPurchase.id,
          chapterId,
          storyId: request.storyId,
          price: totalPrice / chaptersToPurchase.length,
        })
      )
    );

    return {
      id: bulkPurchase.id,
      userId: request.userId,
      storyId: request.storyId,
      chapterIds: chaptersToPurchase,
      totalPrice: Number(bulkPurchase.totalPrice),
      status: "completed",
      createdAt: bulkPurchase.purchasedAt.toISOString(),
      balanceBefore: balanceBefore,
      balanceAfter: deduction.wallet.balance,
      paymentMethod: "wallet",
    };
  }

  async getPurchaseHistory(query: PurchaseHistoryQueryDto) {
    const { userId, storyId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (storyId) {
      where.storyId = storyId;
    }

    const [purchases, total] = await Promise.all([
      this.databaseService.purchase.findMany({
        where,
        orderBy: { purchasedAt: "desc" },
        skip,
        take: limit,
      }),
      this.databaseService.purchase.count({ where }),
    ]);

    return {
      data: purchases.map((p) => this.mapPurchaseToRecord(p)),
      total,
      page,
      limit,
    };
  }

  async getPurchase(purchaseId: string): Promise<PurchaseRecord | null> {
    const purchase = await this.databaseService.purchase.findUnique({
      where: { id: purchaseId },
    });

    return purchase ? this.mapPurchaseToRecord(purchase) : null;
  }

  async refundPurchase(purchaseId: string, reason: string): Promise<PurchaseRecord | null> {
    const purchase = await this.databaseService.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase || purchase.status === PurchaseStatus.REFUNDED || Number(purchase.price) === 0) {
      return purchase ? this.mapPurchaseToRecord(purchase) : null;
    }

    // Refund points
    const refund = await this.virtualCurrencyService.refundPoints({
      userId: purchase.userId,
      amount: Number(purchase.price),
      referenceId: `refund:${purchaseId}`,
      description: reason,
    });

    if (!refund.success) {
      throw new Error("REFUND_FAILED");
    }

    // Update purchase status
    const updated = await this.databaseService.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PurchaseStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: reason,
      },
    });

    // Emit refund event
    await this.eventsService.emitPurchaseRefunded({
      userId: purchase.userId,
      purchaseId: purchase.id,
      chapterId: purchase.chapterId,
      refundAmount: Number(purchase.price),
      reason,
    });

    return this.mapPurchaseToRecord(updated);
  }

  private mapPurchaseToRecord(purchase: any): PurchaseRecord {
    return {
      id: purchase.id,
      userId: purchase.userId,
      storyId: purchase.storyId,
      chapterIds: [purchase.chapterId],
      totalPrice: Number(purchase.price),
      status: purchase.status === PurchaseStatus.COMPLETED ? "completed" : "refunded",
      createdAt: purchase.purchasedAt.toISOString(),
      balanceBefore: Number(purchase.balanceBefore ?? 0),
      balanceAfter: 0, // Will be calculated from wallet if needed
      paymentMethod: purchase.paymentMethod,
      refundedAt: purchase.refundedAt?.toISOString(),
      refundReason: purchase.refundReason ?? undefined,
    };
  }

  private async recordZeroPricePurchase(
    userId: string,
    storyId: string,
    chapterIds: string[]
  ): Promise<PurchaseRecord> {
    // For free chapters, just grant access without creating purchase record
    await Promise.all(
      chapterIds.map((chapterId) =>
        this.paywallService.grantAccess({
          userId,
          chapterId,
          storyId,
          reason: "free",
        })
      )
    );

    return {
      id: `free:${userId}:${chapterIds.join(",")}:${Date.now()}`,
      userId,
      storyId,
      chapterIds,
      totalPrice: 0,
      status: "completed",
      createdAt: new Date().toISOString(),
      balanceBefore: 0,
      balanceAfter: 0,
      paymentMethod: "free",
    };
  }
}
