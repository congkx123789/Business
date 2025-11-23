// Reading Challenge types

// Note: TimeRange is defined in story/ranking.types.ts
// This is a local type for reading challenges
export type ReadingChallengeTimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface ReadingChallenge {
  id: string;
  userId?: string; // If personal challenge
  challengeType: 'personal' | 'community';
  name: string;
  description?: string;
  goal: number; // Target (e.g., number of books, reading time)
  goalType: 'books' | 'chapters' | 'reading-time' | 'pages';
  timeRange: ReadingChallengeTimeRange;
  progress: number; // Current progress
  status: 'active' | 'completed' | 'abandoned';
  startDate: Date;
  endDate: Date;
  participants?: ChallengeParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeParticipant {
  challengeId: string;
  userId: string;
  progress: number;
  joinedAt: Date;
  completedAt?: Date;
}

