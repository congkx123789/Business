// Gamification types (F2P System)

export interface DailyMission {
  id: string;
  userId: string;
  missionType: MissionType;
  date: Date;
  completed: boolean;
  claimed: boolean;
  progress: number; // 0-100
  target: number; // Target value for progress
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionReward {
  id: string;
  missionId: string;
  rewardType: RewardType;
  amount: number;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
}

export interface PowerStone {
  userId: string;
  amount: number; // Daily free votes
  date: Date;
  resetAt: Date; // When it resets (next day)
  createdAt: Date;
  updatedAt: Date;
}

export interface FastPass {
  id: string;
  userId: string;
  storyId?: string;
  chapterId?: string;
  expiresAt: Date; // Expires in 7 days
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export interface GamificationReward {
  id: string;
  userId: string;
  rewardType: RewardType;
  amount: number;
  source: string; // 'daily-mission' | 'ad' | 'exchange' | 'purchase'
  createdAt: Date;
}

export type MissionType = 'check-in' | 'reading' | 'ad' | 'voting';
export type RewardType = 'power-stone' | 'fast-pass' | 'points';

