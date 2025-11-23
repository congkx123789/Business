// Voting types
// Note: PowerStone is defined in user/gamification.types.ts

export interface StoryVote {
  id: string;
  userId: string;
  storyId: string;
  voteType: VoteType;
  votes: number; // Number of votes cast
  castAt: Date;
  createdAt: Date;
}

export type VoteType = 'power-stone' | 'monthly-vote';

