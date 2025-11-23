// Author Ecosystem types

import type { TimeRange } from './ranking.types';

export interface AuthorDashboard {
  authorId: string;
  storyId?: string;
  metrics: {
    totalStories: number;
    totalViews: number;
    totalReads: number;
    totalRevenue: number;
    totalFans: number;
    averageRating: number;
  };
  recentActivity: AuthorActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorAnalytics {
  id: string;
  authorId: string;
  storyId?: string;
  date: Date;
  views: number;
  reads: number;
  revenue: number;
  engagement: {
    comments: number;
    likes: number;
    shares: number;
    recommendations: number;
  };
  readerInsights: ReaderInsights;
  createdAt: Date;
}

export interface AuthorRevenue {
  authorId: string;
  storyId?: string;
  period: TimeRange;
  revenue: {
    ppc: number; // Pay-per-chapter revenue
    tips: number; // Tipping revenue
    subscriptions: number; // Subscription revenue
    privilege: number; // Privilege revenue
    total: number;
  };
  breakdown: RevenueBreakdown[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReaderInsights {
  averageReadingTime: number; // seconds
  completionRate: number; // 0-100
  dropOffPoints: DropOffPoint[];
  popularChapters: string[]; // chapter IDs
  readerDemographics?: {
    ageGroups?: { [key: string]: number };
    regions?: { [key: string]: number };
  };
}

export interface DropOffPoint {
  chapterId: string;
  chapterNumber: number;
  dropOffRate: number; // 0-100
  averageReadingTime: number;
}

export interface RevenueBreakdown {
  date: Date;
  ppc: number;
  tips: number;
  subscriptions: number;
  privilege: number;
  total: number;
}

export interface AuthorActivity {
  type: 'story-published' | 'chapter-published' | 'milestone-reached' | 'fan-interaction';
  description: string;
  timestamp: Date;
  storyId?: string;
  chapterId?: string;
}

// Re-export TimeRange from ranking.types
export type { TimeRange } from './ranking.types';

