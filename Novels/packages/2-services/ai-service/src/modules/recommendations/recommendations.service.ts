import { Injectable } from "@nestjs/common";
import { CollaborativeFilteringService } from "./collaborative-filtering.service";
import { ContentBasedFilteringService } from "./content-based-filtering.service";
import { RecommendationEngineService, RecommendationViewModel } from "./recommendation-engine.service";
import { UserBehaviorAnalyzerService } from "./user-behavior-analyzer.service";
import { MoodBasedRecommendationsService } from "./mood-based-recommendations.service";
import { NaturalLanguageSearchService } from "./natural-language-search.service";
import { FilterBubbleBreakerService } from "./filter-bubble-breaker.service";
import { TrendingAnalyzerService } from "./trending-analyzer.service";
import { RedisCacheService } from "../../cache/redis-cache.service";

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly collaborativeFilteringService: CollaborativeFilteringService,
    private readonly contentBasedFilteringService: ContentBasedFilteringService,
    private readonly recommendationEngineService: RecommendationEngineService,
    private readonly userBehaviorAnalyzerService: UserBehaviorAnalyzerService,
    private readonly moodBasedRecommendationsService: MoodBasedRecommendationsService,
    private readonly naturalLanguageSearchService: NaturalLanguageSearchService,
    private readonly filterBubbleBreakerService: FilterBubbleBreakerService,
    private readonly trendingAnalyzerService: TrendingAnalyzerService,
    private readonly cache: RedisCacheService
  ) {}

  async getRecommendations(userId: number, limit: number): Promise<{ success: boolean; data: RecommendationViewModel[]; message: string }> {
    // Recommendation cache TTL: 1 hour (as per documentation)
    const cacheKey = `recommendations:user:${userId}:limit:${limit}`;
    const ttlMs = 60 * 60 * 1000; // 1 hour in milliseconds

    return this.cache.wrap(cacheKey, async () => {
      const collaborative = await this.collaborativeFilteringService.getUserSimilarStories(userId);
      const content = await this.contentBasedFilteringService.getSimilarStoriesForUser(userId);
      const data = this.recommendationEngineService.combine(collaborative, content, limit);
      return {
        success: true,
        data,
        message: "Recommendations generated",
      };
    }, ttlMs);
  }

  async getMoodRecommendations(userId: number, mood: string, limit: number) {
    const data = await this.moodBasedRecommendationsService.getRecommendations(userId, mood as any, limit);
    return {
      success: true,
      data,
      message: "Mood-based recommendations generated",
    };
  }

  async searchByNaturalLanguage(userId: number, query: string, limit: number) {
    const data = await this.naturalLanguageSearchService.search(userId, query, limit);
    return {
      success: true,
      data,
      message: "Natural language search completed",
    };
  }

  async exploreNewTerritories(userId: number, limit: number) {
    const data = await this.filterBubbleBreakerService.exploreNewTerritories(userId, limit);
    return {
      success: true,
      data,
      message: "Exploration recommendations generated",
    };
  }

  async getSimilarStories(storyId: number, limit: number) {
    const data = await this.contentBasedFilteringService.getSimilarStories(storyId);
    const mapped = data.slice(0, limit).map((item) => ({
      storyId: item.storyId,
      title: `Story #${item.storyId}`,
      score: item.score,
      reason: `Similar tags: ${item.tags.join(", ")}`,
    }));

    return {
      success: true,
      data: mapped,
      message: "Similar stories generated",
    };
  }

  async getTrendingStories(timeRange: "daily" | "weekly" | "monthly", genre?: string, limit = 10) {
    const data = await this.trendingAnalyzerService.getTrendingStories(timeRange, genre, limit);
    return {
      success: true,
      data,
      message: "Trending stories retrieved",
    };
  }

  async explainRecommendation(userId: number, storyId?: number) {
    const snapshot = await this.userBehaviorAnalyzerService.getSnapshot(userId);
    return {
      success: true,
      explanation: `Based on your preference for ${snapshot.preferredGenres.join(", ")} and average sessions of ${
        snapshot.averageSessionMinutes
      } minutes${storyId ? `, Story #${storyId} is a strong match.` : "."}`,
    };
  }
}


