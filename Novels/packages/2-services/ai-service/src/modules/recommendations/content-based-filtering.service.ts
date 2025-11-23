import { Injectable } from "@nestjs/common";

export interface ContentSimilarity {
  storyId: number;
  score: number;
  tags: string[];
}

@Injectable()
export class ContentBasedFilteringService {
  async getSimilarStories(storyId: number): Promise<ContentSimilarity[]> {
    const randomTag = storyId % 2 === 0 ? "Cultivation" : "Revenge";
    return Array.from({ length: 5 }).map((_, index) => ({
      storyId: storyId + index + 1,
      score: Math.max(0.4, 0.9 - index * 0.1),
      tags: [randomTag, "Adventure"],
    }));
  }

  /**
   * Get similar stories based on user's reading history (content-based filtering for recommendations)
   * TODO: Implement actual logic to:
   * 1. Get user's reading history (genres, tags, themes)
   * 2. Find stories with similar metadata
   * 3. Calculate similarity scores
   */
  async getSimilarStoriesForUser(userId: number): Promise<ContentSimilarity[]> {
    // Placeholder: Return stories based on userId pattern
    const randomTag = userId % 2 === 0 ? "Cultivation" : "Revenge";
    return Array.from({ length: 5 }).map((_, index) => ({
      storyId: userId * 10 + index + 1,
      score: Math.max(0.4, 0.9 - index * 0.1),
      tags: [randomTag, "Adventure"],
    }));
  }
}


