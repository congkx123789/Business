import { Injectable } from "@nestjs/common";
import { RecommendationScore } from "./collaborative-filtering.service";
import { ContentSimilarity } from "./content-based-filtering.service";

export interface RecommendationViewModel {
  storyId: number;
  title: string;
  score: number;
  reason: string;
}

@Injectable()
export class RecommendationEngineService {
  combine(collaborative: RecommendationScore[], content: ContentSimilarity[], limit: number): RecommendationViewModel[] {
    const merged = new Map<number, RecommendationViewModel>();

    collaborative.forEach((item) => {
      merged.set(item.storyId, {
        storyId: item.storyId,
        title: `Story #${item.storyId}`,
        score: item.score * 0.6,
        reason: item.reason,
      });
    });

    content.forEach((item) => {
      const existing = merged.get(item.storyId);
      if (existing) {
        existing.score = Number((existing.score + item.score * 0.4).toFixed(2));
        existing.reason = `${existing.reason}; Similar tags: ${item.tags.join(", ")}`;
      } else {
        merged.set(item.storyId, {
          storyId: item.storyId,
          title: `Story #${item.storyId}`,
          score: Number((item.score * 0.4).toFixed(2)),
          reason: `Similar tags: ${item.tags.join(", ")}`,
        });
      }
    });

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}


