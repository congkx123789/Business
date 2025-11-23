import { Injectable } from "@nestjs/common";

type TimeRange = "daily" | "weekly" | "monthly";

@Injectable()
export class TrendingAnalyzerService {
  async getTrendingStories(timeRange: TimeRange, genre?: string, limit = 10) {
    return Array.from({ length: limit }).map((_, index) => ({
      storyId: 8000 + index,
      title: `${genre ?? "All"} Trending #${index + 1}`,
      reason: `Hot ${timeRange} pick`,
      score: Number((0.95 - index * 0.05).toFixed(2)),
    }));
  }
}


