// Ranking types

import type { Story } from './story.types';

export interface Ranking {
  id: string;
  rankingType: RankingType;
  genre?: string;
  timeRange: TimeRange;
  stories: RankingStory[];
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingStory {
  storyId: string;
  story?: Story;
  position: number;
  score: number;
  change: number; // Position change from previous ranking
}

export type RankingType = 'monthly-votes' | 'recommendations' | 'sales' | 'popularity';
export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'all-time';

