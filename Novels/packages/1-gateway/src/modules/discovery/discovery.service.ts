import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  GrpcPaginatedResponse,
  GrpcResponse,
} from "../../common/types/grpc.types";
import {
  getGrpcResultOrThrow,
  getGrpcDataOrThrow,
} from "../../common/utils/grpc.util";

interface StoriesServiceClient {
  GetRankings(data: {
    type?: string;
    genre?: string;
    timeRange?: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  GetEditorPicks(data: {
    limit?: number;
    genre?: string;
  }): Observable<GrpcResponse<any[]>>;
  GetGenres(data: Record<string, never>): Observable<GrpcResponse<any[]>>;
  GetGenreStories(data: {
    genreId: string;
    page?: number;
    limit?: number;
    sort?: string;
    filters?: string;
  }): Observable<GrpcPaginatedResponse<any>>;
  GetStorefront(
    data: Record<string, never>,
  ): Observable<GrpcResponse<Record<string, any>>>;
  GetAuthorDashboard(data: {
    authorId: string;
  }): Observable<GrpcResponse<any>>;
  GetAuthorAnalytics(data: {
    authorId: string;
  }): Observable<GrpcResponse<any>>;
  GetAuthorRevenue(data: {
    authorId: string;
  }): Observable<GrpcResponse<any>>;
  GetAuthorEngagement(data: {
    authorId: string;
  }): Observable<GrpcResponse<any>>;
  GetReaderInsights(data: {
    authorId: string;
  }): Observable<GrpcResponse<any>>;
  CastPowerStone(data: {
    storyId: string;
    userId: string;
    amount?: number;
  }): Observable<GrpcResponse<any>>;
  CastMonthlyVote(data: {
    storyId: string;
    userId: string;
    amount?: number;
  }): Observable<GrpcResponse<any>>;
  GetUserVotes(data: {
    userId: string;
  }): Observable<GrpcResponse<any>>;
}

interface SearchServiceClient {
  Search(data: {
    query: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Observable<GrpcPaginatedResponse<any>>;
}

@Injectable()
export class DiscoveryService implements OnModuleInit {
  private storiesService!: StoriesServiceClient;
  private searchService!: SearchServiceClient;

  constructor(
    @Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc,
    @Inject("SEARCH_SERVICE") private readonly searchClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.storiesService =
      this.storiesClient.getService<StoriesServiceClient>("StoriesService");
    this.searchService =
      this.searchClient.getService<SearchServiceClient>("SearchService");
  }

  getRankings(params: {
    type?: string;
    genre?: string;
    timeRange?: string;
  }) {
    return getGrpcResultOrThrow(
      this.storiesService.GetRankings(params),
      "Failed to load rankings",
    );
  }

  getEditorPicks(params: { limit?: number; genre?: string }) {
    return getGrpcResultOrThrow(
      this.storiesService.GetEditorPicks(params),
      "Failed to load editor picks",
    );
  }

  getGenres() {
    return getGrpcDataOrThrow(
      this.storiesService.GetGenres({}),
      "Failed to load genres",
    );
  }

  getGenreStories(params: {
    genreId: string;
    page?: number;
    limit?: number;
    sort?: string;
    filters?: string;
  }) {
    return getGrpcResultOrThrow(
      this.storiesService.GetGenreStories(params),
      "Failed to load genre stories",
    );
  }

  getStorefront() {
    return getGrpcDataOrThrow(
      this.storiesService.GetStorefront({}),
      "Failed to load storefront",
    );
  }

  searchStories(params: {
    query: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    return getGrpcResultOrThrow(
      this.searchService.Search(params),
      "Failed to search stories",
    );
  }

  getAuthorDashboard(authorId: string) {
    return getGrpcDataOrThrow(
      this.storiesService.GetAuthorDashboard({ authorId }),
      "Failed to load author dashboard",
    );
  }

  getAuthorAnalytics(authorId: string) {
    return getGrpcDataOrThrow(
      this.storiesService.GetAuthorAnalytics({ authorId }),
      "Failed to load author analytics",
    );
  }

  getAuthorRevenue(authorId: string) {
    return getGrpcDataOrThrow(
      this.storiesService.GetAuthorRevenue({ authorId }),
      "Failed to load author revenue",
    );
  }

  getAuthorEngagement(authorId: string) {
    return getGrpcDataOrThrow(
      this.storiesService.GetAuthorEngagement({ authorId }),
      "Failed to load author engagement metrics",
    );
  }

  getReaderInsights(authorId: string) {
    return getGrpcDataOrThrow(
      this.storiesService.GetReaderInsights({ authorId }),
      "Failed to load reader insights",
    );
  }

  castPowerStone(input: { storyId: string; userId: string; amount?: number }) {
    return getGrpcDataOrThrow(
      this.storiesService.CastPowerStone(input),
      "Failed to cast Power Stone",
    );
  }

  castMonthlyVote(input: { storyId: string; userId: string; amount?: number }) {
    return getGrpcDataOrThrow(
      this.storiesService.CastMonthlyVote(input),
      "Failed to cast monthly vote",
    );
  }

  getUserVotes(userId: string) {
    return getGrpcDataOrThrow(
      this.storiesService.GetUserVotes({ userId }),
      "Failed to load user votes",
    );
  }
}
