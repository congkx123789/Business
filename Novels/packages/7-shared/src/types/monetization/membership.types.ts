// Membership types (Coin Packages)

export interface Membership {
  id: string;
  userId: string;
  planId: string;
  plan?: MembershipPlan;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number; // In real currency (CNY)
  coinsGranted: number; // Immediate coin grant
  dailyBonus: number; // Daily login bonus
  billingPeriod: 'monthly' | 'yearly';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipDailyBonus {
  id: string;
  membershipId: string;
  userId: string;
  date: Date;
  coinsAwarded: number;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
}

