import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { MonetizationEventsService } from "../../common/queue/monetization-events.service";
import { VirtualCurrencyService } from "../virtual-currency/virtual-currency.service";
import { CreateMembershipDto, MembershipRecord } from "./dto/create-membership.dto";
import { ClaimDailyBonusDto } from "./dto/claim-daily-bonus.dto";
import { MembershipStatus, BillingPeriod } from "@prisma/monetization-service-client";

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsService: MonetizationEventsService,
    private readonly virtualCurrencyService: VirtualCurrencyService
  ) {}

  async createMembership(dto: CreateMembershipDto): Promise<MembershipRecord> {
    // Check if user already has active membership
    const existing = await this.databaseService.membership.findUnique({
      where: { userId: dto.userId },
      include: { plan: true },
    });

    if (existing && existing.status === MembershipStatus.ACTIVE) {
      // Return existing membership
      return this.mapMembershipToRecord(existing);
    }

    // Get or create membership plan
    let plan = await this.databaseService.membershipPlan.findFirst({
      where: {
        id: dto.planId,
        isActive: true,
      },
    });

    if (!plan) {
      // Create default plan if not exists
      plan = await this.databaseService.membershipPlan.create({
        data: {
          id: dto.planId,
          name: `Plan ${dto.planId}`,
          type: "membership",
          price: 0,
          currency: "CNY",
          coinsGranted: dto.coinsGranted,
          dailyBonus: dto.dailyBonus,
          billingPeriod: dto.billingPeriod === "monthly" ? BillingPeriod.MONTHLY : BillingPeriod.YEARLY,
          isActive: true,
        },
      });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = this.calculateEndDate(dto.billingPeriod, startDate);

    // Create membership and grant coins in transaction
    const membership = await this.databaseService.$transaction(async (tx) => {
      // Create or update membership
      const membershipRecord = await tx.membership.upsert({
        where: { userId: dto.userId },
        create: {
          userId: dto.userId,
          planId: plan.id,
          status: MembershipStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew: dto.autoRenew ?? true,
        },
        update: {
          planId: plan.id,
          status: MembershipStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew: dto.autoRenew ?? true,
          cancelledAt: null,
        },
      });

      // Grant coins immediately
      await this.virtualCurrencyService.topUp({
        userId: dto.userId,
        amount: dto.coinsGranted,
        paymentMethod: "membership",
        metadata: { planId: dto.planId, membershipId: membershipRecord.id },
      });

      return membershipRecord;
    });

    // Emit membership created event
    await this.eventsService.emitMembershipCreated({
      userId: dto.userId,
      membershipId: membership.id,
      planId: dto.planId,
      coinsGranted: dto.coinsGranted,
    });

    return this.mapMembershipToRecord(membership);
  }

  async getMembership(userId: string): Promise<MembershipRecord | null> {
    const membership = await this.databaseService.membership.findUnique({
      where: { userId },
      include: { plan: true },
    });

    return membership ? this.mapMembershipToRecord(membership) : null;
  }

  async cancelMembership(userId: string): Promise<MembershipRecord | null> {
    const membership = await this.databaseService.membership.findUnique({
      where: { userId },
    });

    if (!membership) {
      return null;
    }

    const updated = await this.databaseService.membership.update({
      where: { userId },
      data: {
        status: MembershipStatus.CANCELLED,
        autoRenew: false,
        cancelledAt: new Date(),
      },
    });

    // Emit membership cancelled event
    await this.eventsService.emitMembershipCancelled({
      userId,
    });

    return this.mapMembershipToRecord(updated);
  }

  async claimDailyBonus(dto: ClaimDailyBonusDto) {
    const membership = await this.databaseService.membership.findUnique({
      where: { userId: dto.userId },
      include: { plan: true },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new Error("MEMBERSHIP_NOT_FOUND");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already claimed today
    const existingBonus = await this.databaseService.membershipDailyBonus.findUnique({
      where: {
        membershipId_date: {
          membershipId: membership.id,
          date: today,
        },
      },
    });

    if (existingBonus && existingBonus.claimed) {
      return { claimed: false, message: "Bonus already claimed today" };
    }

    // Claim bonus in transaction
    const result = await this.databaseService.$transaction(async (tx) => {
      // Create or update daily bonus record
      const bonus = await tx.membershipDailyBonus.upsert({
        where: {
          membershipId_date: {
            membershipId: membership.id,
            date: today,
          },
        },
        create: {
          membershipId: membership.id,
          userId: dto.userId,
          date: today,
          coinsAwarded: membership.plan.dailyBonus,
          claimed: true,
          claimedAt: new Date(),
        },
        update: {
          claimed: true,
          claimedAt: new Date(),
        },
      });

      // Grant coins
      const topUpResult = await this.virtualCurrencyService.topUp({
        userId: dto.userId,
        amount: Number(membership.plan.dailyBonus),
        paymentMethod: "daily_bonus",
        metadata: { membershipId: membership.id },
      });

      return { bonus, topUpResult };
    });

    // Emit daily bonus claimed event
    await this.eventsService.emitDailyBonusClaimed({
      userId: dto.userId,
      membershipId: membership.id,
      coinsAwarded: Number(membership.plan.dailyBonus),
    });

    return {
      claimed: true,
      amount: Number(membership.plan.dailyBonus),
      newBalance: result.topUpResult.wallet.balance,
      membership: this.mapMembershipToRecord(membership),
    };
  }

  private calculateEndDate(period: "monthly" | "yearly", startDate: Date): Date {
    const endDate = new Date(startDate);
    if (period === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  private mapMembershipToRecord(membership: any): MembershipRecord {
    return {
      id: membership.id,
      userId: membership.userId,
      planId: membership.planId,
      status: membership.status.toLowerCase(),
      startDate: membership.startDate.toISOString(),
      endDate: membership.endDate.toISOString(),
      autoRenew: membership.autoRenew,
      coinsGranted: Number(membership.plan?.coinsGranted ?? 0),
      dailyBonus: Number(membership.plan?.dailyBonus ?? 0),
      lastDailyBonusClaim: undefined, // Will be fetched separately if needed
    };
  }
}
