import { Injectable } from "@nestjs/common";
import { BillingPeriod, SubscriptionStatus } from "@prisma/monetization-service-client";
import { DatabaseService } from "../../../common/database/database.service";
import { MonetizationEventsService } from "../../../common/queue/monetization-events.service";
import { VirtualCurrencyService } from "../../virtual-currency/virtual-currency.service";
import { SubscriptionRecord } from "../dto/subscription.dto";

@Injectable()
export class AllYouCanReadService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsService: MonetizationEventsService,
    private readonly virtualCurrencyService: VirtualCurrencyService
  ) {}

  async createSubscription(userId: string, planId: string, autoRenew = true, idempotencyKey?: string) {
    const plan = await this.ensurePlan(planId);
    const startDate = new Date();
    const endDate = this.calculateEndDate(plan.billingPeriod, startDate);

    if (Number(plan.price) > 0) {
      const referenceId =
        idempotencyKey ?? `subscription:${userId}:${planId}:${startDate.getTime()}`;
      const deduction = await this.virtualCurrencyService.deductPoints({
        userId,
        amount: Number(plan.price),
        referenceId,
        description: `Subscription ${plan.name}`,
      });

      if (!deduction.success) {
        throw new Error("INSUFFICIENT_FUNDS");
      }
    }

    const subscription = await this.databaseService.$transaction(async (tx) => {
      const subscriptionRecord = await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew,
        },
        update: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          autoRenew,
          cancelledAt: null,
        },
      });

      await tx.subscriptionTransaction.create({
        data: {
          subscriptionId: subscriptionRecord.id,
          userId,
          planId: plan.id,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod: "wallet",
          status: "completed",
          billingPeriod: plan.billingPeriod,
          periodStart: startDate,
          periodEnd: endDate,
        },
      });

      return subscriptionRecord;
    });

    await this.eventsService.emitSubscriptionCreated({
      userId,
      subscriptionId: subscription.id,
      planId: plan.id,
    });

    return this.mapSubscription(subscription, plan, endDate);
  }

  async getSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const subscription = await this.databaseService.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      return null;
    }

    return this.mapSubscription(subscription, subscription.plan);
  }

  async cancelSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const subscription = await this.databaseService.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      return null;
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return this.mapSubscription(subscription, subscription.plan);
    }

    const updated = await this.databaseService.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        autoRenew: false,
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });

    await this.eventsService.emitSubscriptionCancelled({
      userId,
      subscriptionId: updated.id,
    });

    return this.mapSubscription(updated, updated.plan);
  }

  private async ensurePlan(planId: string) {
    const plan = await this.databaseService.subscriptionPlan.findFirst({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new Error("SUBSCRIPTION_PLAN_NOT_FOUND");
    }

    return plan;
  }

  private calculateEndDate(period: BillingPeriod, startDate: Date) {
    const endDate = new Date(startDate);
    if (period === BillingPeriod.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  private mapSubscription(entity: any, plan: any, endDateOverride?: Date): SubscriptionRecord {
    return {
      id: entity.id,
      userId: entity.userId,
      planId: entity.planId,
      status: entity.status.toLowerCase(),
      startDate: entity.startDate.toISOString(),
      endDate: (endDateOverride ?? entity.endDate).toISOString(),
      autoRenew: entity.autoRenew,
      libraryScope: plan?.libraryScope ?? undefined,
    };
  }
}

