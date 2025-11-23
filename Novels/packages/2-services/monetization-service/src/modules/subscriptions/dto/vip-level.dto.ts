export interface VipLevel {
  level: number;
  name: string;
  minSpending: number;
  discountPercent: number;
  monthlyVotes: number;
  benefits: string[];
}

export interface VipMemberSnapshot {
  userId: string;
  currentLevel: VipLevel;
  totalSpending: number;
  lastUpdatedAt: string;
}

export interface VipHistoryEntry {
  id: string;
  userId: string;
  level: number;
  levelName: string;
  totalSpending: number;
  achievedAt: string;
}


