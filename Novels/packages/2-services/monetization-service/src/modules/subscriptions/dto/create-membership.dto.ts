export interface CreateMembershipDto {
  userId: string;
  planId: string;
  coinsGranted: number;
  dailyBonus: number;
  billingPeriod: "monthly" | "yearly";
  autoRenew?: boolean;
}

export interface MembershipRecord {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  coinsGranted: number;
  dailyBonus: number;
  lastDailyBonusClaim?: string;
}


