import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class MonetizationEventsService {
  constructor(
    @InjectQueue("wallet-events") private readonly walletQueue: Queue,
    @InjectQueue("purchase-events") private readonly purchaseQueue: Queue,
    @InjectQueue("subscription-events") private readonly subscriptionQueue: Queue,
    @InjectQueue("vip-events") private readonly vipQueue: Queue
  ) {}

  // Virtual Currency Events
  async emitWalletTopUpCompleted(data: {
    userId: string;
    amount: number;
    pointsAwarded: number;
    transactionId: string;
  }) {
    await this.walletQueue.add("wallet.topup.completed", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitWalletBalanceUpdated(data: {
    userId: string;
    balance: number;
    previousBalance: number;
  }) {
    await this.walletQueue.add("wallet.balance.updated", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitWalletLowBalance(data: {
    userId: string;
    balance: number;
    threshold: number;
  }) {
    await this.walletQueue.add("wallet.low_balance", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  // Payment Events
  async emitPurchaseCompleted(data: {
    userId: string;
    purchaseId: string;
    chapterId: string;
    storyId: string;
    price: number;
  }) {
    await this.purchaseQueue.add("purchase.completed", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitPurchaseRefunded(data: {
    userId: string;
    purchaseId: string;
    chapterId: string;
    refundAmount: number;
    reason: string;
  }) {
    await this.purchaseQueue.add("purchase.refunded", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitPurchaseFailed(data: {
    userId: string;
    chapterId: string;
    reason: string;
  }) {
    await this.purchaseQueue.add("purchase.failed", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  // Subscription Events
  async emitSubscriptionCreated(data: {
    userId: string;
    subscriptionId: string;
    planId: string;
  }) {
    await this.subscriptionQueue.add("subscription.created", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitSubscriptionRenewed(data: {
    userId: string;
    subscriptionId: string;
    planId: string;
  }) {
    await this.subscriptionQueue.add("subscription.renewed", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitSubscriptionCancelled(data: {
    userId: string;
    subscriptionId: string;
  }) {
    await this.subscriptionQueue.add("subscription.cancelled", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitSubscriptionExpired(data: {
    userId: string;
    subscriptionId: string;
  }) {
    await this.subscriptionQueue.add("subscription.expired", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitMembershipCreated(data: {
    userId: string;
    membershipId: string;
    planId: string;
    coinsGranted: number;
  }) {
    await this.subscriptionQueue.add("membership.created", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitMembershipRenewed(data: {
    userId: string;
    membershipId: string;
    coinsGranted: number;
  }) {
    await this.subscriptionQueue.add("membership.renewed", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitMembershipCancelled(data: {
    userId: string;
    membershipId: string;
  }) {
    await this.subscriptionQueue.add("membership.cancelled", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitDailyBonusClaimed(data: {
    userId: string;
    membershipId: string;
    coinsAwarded: number;
  }) {
    await this.subscriptionQueue.add("daily-bonus.claimed", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitPrivilegePurchased(data: {
    userId: string;
    storyId: string;
    privilegeId: string;
    coinsSpent: number;
  }) {
    await this.subscriptionQueue.add("privilege.purchased", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitPrivilegeExpired(data: {
    userId: string;
    storyId: string;
    privilegeId: string;
  }) {
    await this.subscriptionQueue.add("privilege.expired", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  // VIP Events
  async emitVIPLevelUpgraded(data: {
    userId: string;
    levelFrom: number;
    levelTo: number;
    totalSpending: number;
  }) {
    await this.vipQueue.add("vip.level.upgraded", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  async emitVIPSpendingRecorded(data: {
    userId: string;
    amount: number;
    totalSpending: number;
    currentLevel: number;
  }) {
    await this.vipQueue.add("vip.spending.recorded", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }
}

