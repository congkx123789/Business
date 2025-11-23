// Activity Tracking types

// Note: TimeRange is defined in story/ranking.types.ts
// This is a local type for activity tracking
export type ActivityTimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface ActivityTracking {
  id: string;
  userId: string;
  activityType: ActivityType;
  storyId?: string;
  chapterId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  goalType: 'books' | 'chapters' | 'reading-time' | 'pages';
  target: number;
  current: number;
  timeRange: ActivityTimeRange;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 
  | 'story-viewed'
  | 'chapter-read'
  | 'chapter-completed'
  | 'chapter-abandoned'
  | 'story-liked'
  | 'comment-created'
  | 'review-created'
  | 'story-shared'
  | 'challenge-joined'
  | 'goal-set';

