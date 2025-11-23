import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  GrpcPaginatedResponse,
  GrpcResponse,
} from "../../common/types/grpc.types";
import {
  getGrpcDataOrThrow,
  getGrpcResultOrThrow,
} from "../../common/utils/grpc.util";

interface AiServiceClient {
  GetRecommendations(data: {
    userId: string;
    limit?: number;
    context?: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  GetMoodBasedRecommendations(data: {
    userId: string;
    mood?: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  NaturalLanguageSearch(data: {
    query: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  ExploreNewTerritories(data: {
    userId: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  GetTrendingStories(data: {
    genre?: string;
    timeRange?: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  ExplainRecommendation(data: {
    storyId: string;
    userId: string;
  }): Observable<GrpcResponse<any>>;
}

interface StoriesServiceClient {
  GetSimilarStories(data: {
    storyId: string;
    limit?: number;
  }): Observable<GrpcPaginatedResponse<any>>;
}

@Injectable()
export class RecommendationsService implements OnModuleInit {
  private aiService!: AiServiceClient;
  private storiesService!: StoriesServiceClient;

  constructor(
    @Inject("AI_SERVICE") private readonly aiClient: ClientGrpc,
    @Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.aiService = this.aiClient.getService<AiServiceClient>("AIService");
    this.storiesService =
      this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  getRecommendations(params: { userId: string; limit?: number; context?: string }) {
    return getGrpcResultOrThrow(
      this.aiService.GetRecommendations(params),
      "Failed to load recommendations",
    );
  }

  getMoodBasedRecommendations(userId: string, mood?: string) {
    return getGrpcResultOrThrow(
      this.aiService.GetMoodBasedRecommendations({ userId, mood }),
      "Failed to load mood-based recommendations",
    );
  }

  naturalLanguageSearch(query: string) {
    return getGrpcResultOrThrow(
      this.aiService.NaturalLanguageSearch({ query }),
      "Failed to run natural language search",
    );
  }

  exploreNewTerritories(userId: string) {
    return getGrpcResultOrThrow(
      this.aiService.ExploreNewTerritories({ userId }),
      "Failed to explore new territories",
    );
  }

  getSimilarStories(storyId: string, limit?: number) {
    return getGrpcResultOrThrow(
      this.storiesService.GetSimilarStories({ storyId, limit }),
      "Failed to load similar stories",
    );
  }

  getTrendingStories(params: { genre?: string; timeRange?: string }) {
    return getGrpcResultOrThrow(
      this.aiService.GetTrendingStories(params),
      "Failed to load trending stories",
    );
  }

  explainRecommendation(storyId: string, userId: string) {
    return getGrpcDataOrThrow(
      this.aiService.ExplainRecommendation({ storyId, userId }),
      "Failed to explain recommendation",
    );
  }
}

