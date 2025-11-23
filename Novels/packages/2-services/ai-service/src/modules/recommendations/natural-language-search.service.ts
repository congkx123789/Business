import { Injectable } from "@nestjs/common";

@Injectable()
export class NaturalLanguageSearchService {
  async search(userId: number, query: string, limit: number) {
    const keywords = query.split(/\s+/).filter(Boolean).slice(0, 3);
    return Array.from({ length: limit }).map((_, index) => ({
      storyId: index + 1,
      title: `Match for "${keywords.join(" ")}" #${index + 1}`,
      reason: `Semantic match for query "${query}"`,
      score: Number((0.85 - index * 0.04).toFixed(2)),
    }));
  }
}


