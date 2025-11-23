import { Injectable } from "@nestjs/common";

export interface RecommendationScore {
  storyId: number;
  score: number;
  reason: string;
}

@Injectable()
export class CollaborativeFilteringService {
  async getUserSimilarStories(userId: number): Promise<RecommendationScore[]> {
    // Placeholder logic: in real scenario, compute using matrices.
    const baseScore = (userId % 5) + 1;
    return Array.from({ length: 5 }).map((_, index) => ({
      storyId: baseScore * 100 + index,
      score: Math.max(0.5, 1 - index * 0.1),
      reason: "Users with similar taste enjoyed this story",
    }));
  }
}


