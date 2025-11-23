import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { MonetizationEventsService } from "../../common/queue/monetization-events.service";
import { VirtualCurrencyService } from "../virtual-currency/virtual-currency.service";
import { PrivilegeStatus } from "@prisma/monetization-service-client";

const PRIVILEGE_PRICE = 1000; // 1000 points for privilege
const ADVANCED_CHAPTER_PRICE = 25; // 25 points per advanced chapter

@Injectable()
export class PrivilegeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsService: MonetizationEventsService,
    private readonly virtualCurrencyService: VirtualCurrencyService
  ) {}

  async getPrivilegeStatus(data: { userId: string; storyId: string }) {
    const privilege = await this.databaseService.privilege.findUnique({
      where: {
        userId_storyId: {
          userId: data.userId,
          storyId: data.storyId,
        },
      },
    });

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    if (privilege && privilege.status === PrivilegeStatus.ACTIVE && privilege.expiresAt > now) {
      return {
        success: true,
        data: {
          userId: privilege.userId,
          storyId: privilege.storyId,
          hasPrivilege: true,
          purchaseDate: privilege.purchasedAt.toISOString(),
          expiresAt: privilege.expiresAt.toISOString(),
          price: PRIVILEGE_PRICE,
        },
      };
    }

    return {
      success: true,
      data: {
        userId: data.userId,
        storyId: data.storyId,
        hasPrivilege: false,
        purchaseDate: null,
        expiresAt: nextMonth.toISOString(),
        price: PRIVILEGE_PRICE,
      },
    };
  }

  async purchasePrivilege(data: {
    userId: string;
    storyId: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }) {
    // Check if privilege already exists and is active
    const existing = await this.databaseService.privilege.findUnique({
      where: {
        userId_storyId: {
          userId: data.userId,
          storyId: data.storyId,
        },
      },
    });

    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 1st of next month

    // If already active and not expired, return existing
    if (existing && existing.status === PrivilegeStatus.ACTIVE && existing.expiresAt > now) {
      return {
        success: true,
        data: {
          id: existing.id,
          userId: existing.userId,
          storyId: existing.storyId,
          price: PRIVILEGE_PRICE,
          purchaseDate: existing.purchasedAt.toISOString(),
          expiresAt: existing.expiresAt.toISOString(),
        },
      };
    }

    // Deduct points
    const deduction = await this.virtualCurrencyService.deductPoints({
      userId: data.userId,
      amount: PRIVILEGE_PRICE,
      referenceId: data.idempotencyKey ?? `${data.userId}:${data.storyId}:${now.getMonth()}`,
      description: `Privilege fee for story ${data.storyId}`,
    });

    if (!deduction.success) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // Create or update privilege in transaction
    const privilege = await this.databaseService.$transaction(async (tx) => {
      // Create or update privilege
      const privilegeRecord = await tx.privilege.upsert({
        where: {
          userId_storyId: {
            userId: data.userId,
            storyId: data.storyId,
          },
        },
        create: {
          userId: data.userId,
          storyId: data.storyId,
          purchasedAt: now,
          expiresAt,
          status: PrivilegeStatus.ACTIVE,
        },
        update: {
          purchasedAt: now,
          expiresAt,
          status: PrivilegeStatus.ACTIVE,
        },
      });

      // Create privilege purchase record
      await tx.privilegePurchase.create({
        data: {
          privilegeId: privilegeRecord.id,
          userId: data.userId,
          storyId: data.storyId,
          coinsSpent: PRIVILEGE_PRICE,
          purchasedAt: now,
        },
      });

      return privilegeRecord;
    });

    // Emit privilege purchased event
    await this.eventsService.emitPrivilegePurchased({
      userId: data.userId,
      storyId: data.storyId,
      privilegeId: privilege.id,
      coinsSpent: PRIVILEGE_PRICE,
    });

    return {
      success: true,
      data: {
        id: privilege.id,
        userId: privilege.userId,
        storyId: privilege.storyId,
        price: PRIVILEGE_PRICE,
        purchaseDate: privilege.purchasedAt.toISOString(),
        expiresAt: privilege.expiresAt.toISOString(),
      },
    };
  }

  async getAdvancedChapters(data: { storyId: string; userId?: string }) {
    // Get advanced chapters for the story
    const advancedChapters = await this.databaseService.advancedChapter.findMany({
      where: {
        storyId: data.storyId,
        privilegeRequired: true,
      },
      orderBy: {
        chapterNumber: "asc",
      },
    });

    // If userId provided, check which chapters are purchased
    let purchasedChapterIds: string[] = [];
    if (data.userId) {
      const purchases = await this.databaseService.purchase.findMany({
        where: {
          userId: data.userId,
          storyId: data.storyId,
          chapterId: {
            in: advancedChapters.map((ch) => ch.chapterId),
          },
        },
      });
      purchasedChapterIds = purchases.map((p) => p.chapterId);
    }

    return {
      success: true,
      data: advancedChapters.map((chapter) => ({
        chapterId: chapter.chapterId,
        title: "", // Will be fetched from stories service if needed
        order: chapter.chapterNumber,
        price: Number(chapter.premiumPrice),
        purchased: purchasedChapterIds.includes(chapter.chapterId),
        releaseDate: chapter.releaseDate.toISOString(),
      })),
    };
  }

  async purchaseAdvancedChapter(data: {
    userId: string;
    chapterId: string;
    storyId: string;
    idempotencyKey?: string;
  }) {
    // Check if user has privilege
    const privilege = await this.databaseService.privilege.findUnique({
      where: {
        userId_storyId: {
          userId: data.userId,
          storyId: data.storyId,
        },
      },
    });

    if (!privilege || privilege.status !== PrivilegeStatus.ACTIVE || privilege.expiresAt < new Date()) {
      throw new Error("PRIVILEGE_REQUIRED");
    }

    // Check if chapter is advanced
    const advancedChapter = await this.databaseService.advancedChapter.findUnique({
      where: {
        storyId_chapterId: {
          storyId: data.storyId,
          chapterId: data.chapterId,
        },
      },
    });

    if (!advancedChapter || !advancedChapter.privilegeRequired) {
      throw new Error("NOT_AN_ADVANCED_CHAPTER");
    }

    // Check if already purchased (idempotent)
    const existingPurchase = await this.databaseService.purchase.findUnique({
      where: {
        userId_chapterId: {
          userId: data.userId,
          chapterId: data.chapterId,
        },
      },
    });

    if (existingPurchase) {
      return {
        success: true,
        data: {
          id: existingPurchase.id,
          userId: existingPurchase.userId,
          chapterId: existingPurchase.chapterId,
          storyId: existingPurchase.storyId,
          price: Number(existingPurchase.price),
          purchasedAt: existingPurchase.purchasedAt.toISOString(),
          balanceAfter: 0, // Will be calculated if needed
        },
      };
    }

    // Deduct points
    const price = Number(advancedChapter.premiumPrice) || ADVANCED_CHAPTER_PRICE;
    const deduction = await this.virtualCurrencyService.deductPoints({
      userId: data.userId,
      amount: price,
      referenceId: data.idempotencyKey ?? `${data.chapterId}:${Date.now()}`,
      description: `Advanced chapter ${data.chapterId}`,
    });

    if (!deduction.success) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // Create purchase record
    const purchase = await this.databaseService.purchase.create({
      data: {
        userId: data.userId,
        chapterId: data.chapterId,
        storyId: data.storyId,
        price: price,
        characterCount: 0, // Will be updated from stories service
        status: "COMPLETED" as any,
        paymentMethod: "wallet",
      },
    });

    // Emit purchase completed event
    await this.eventsService.emitPurchaseCompleted({
      userId: data.userId,
      purchaseId: purchase.id,
      chapterId: data.chapterId,
      storyId: data.storyId,
      price: price,
    });

    return {
      success: true,
      data: {
        id: purchase.id,
        userId: purchase.userId,
        chapterId: purchase.chapterId,
        storyId: purchase.storyId,
        price: price,
        purchasedAt: purchase.purchasedAt.toISOString(),
        balanceAfter: deduction.wallet.balance,
      },
    };
  }

  // Background job: Reset privileges monthly (should be called on 1st of month)
  async resetMonthlyPrivileges() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find all privileges that should be reset (expired on 1st of month)
    const expiredPrivileges = await this.databaseService.privilege.findMany({
      where: {
        status: PrivilegeStatus.ACTIVE,
        expiresAt: {
          lte: firstOfMonth,
        },
      },
    });

    // Update all expired privileges
    await this.databaseService.privilege.updateMany({
      where: {
        id: {
          in: expiredPrivileges.map((p) => p.id),
        },
      },
      data: {
        status: PrivilegeStatus.EXPIRED,
      },
    });

    // Emit expired events
    await Promise.all(
      expiredPrivileges.map((privilege) =>
        this.eventsService.emitPrivilegeExpired({
          userId: privilege.userId,
          storyId: privilege.storyId,
          privilegeId: privilege.id,
        })
      )
    );

    return { resetCount: expiredPrivileges.length };
  }
}
