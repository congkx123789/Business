import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { lastValueFrom } from "rxjs";
import { DatabaseService } from "../../common/database/database.service";
import { MONETIZATION_GRPC_CLIENT } from "../../clients/monetization-client.module";
import { COMMUNITY_GRPC_CLIENT } from "../../clients/community-client.module";
import { USERS_GRPC_CLIENT } from "../../clients/users-client.module";
import { AuthorAnalyticsQueryDto, AuthorRevenueQueryDto, AuthorEngagementQueryDto, ReaderInsightsQueryDto } from "./dto/author-dashboard.dto";

interface MonetizationServiceClient {
  GetPurchaseHistory(data: any): any;
  GetTransactionHistory(data: any): any;
}

interface CommunityServiceClient {
  GetStoryVotes(data: any): any;
  GetStoryTips(data: any): any;
  GetStoryComments(data: any): any;
}

interface UsersServiceClient {
  GetReadingBehavior(data: any): any;
}

@Injectable()
export class AuthorAnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AuthorAnalyticsService.name);
  private monetizationService: MonetizationServiceClient | null = null;
  private communityService: CommunityServiceClient | null = null;
  private usersService: UsersServiceClient | null = null;

  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(MONETIZATION_GRPC_CLIENT) private readonly monetizationGrpcClient: ClientGrpc,
    @Inject(COMMUNITY_GRPC_CLIENT) private readonly communityGrpcClient: ClientGrpc,
    @Inject(USERS_GRPC_CLIENT) private readonly usersGrpcClient: ClientGrpc,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    this.monetizationService = this.monetizationGrpcClient.getService<MonetizationServiceClient>("MonetizationService");
    this.communityService = this.communityGrpcClient.getService<CommunityServiceClient>("CommunityService");
    this.usersService = this.usersGrpcClient.getService<UsersServiceClient>("UsersService");
  }

  async getAuthorAnalytics(query: AuthorAnalyticsQueryDto) {
    const cacheKey = `author-analytics:${query.authorId}:${query.storyId || "all"}:${query.timeRange || "all-time"}`;

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: "Author analytics retrieved successfully (cached)",
        };
      }

      // Get analytics from database
      const result = await this.databaseService.createData<any[]>(11, "spAuthorAnalytics_Get", [
        ["AuthorId", query.authorId],
        ["StoryId", query.storyId || 0],
        ["TimeRange", query.timeRange || "all-time"],
      ]);

      const analytics = Array.isArray(result) ? result[0] : null;

      if (analytics) {
        // Enrich with real-time data from other services
        const enriched = await this.enrichAnalytics(analytics, query);
        await this.cacheManager.set(cacheKey, enriched, 3600); // Cache for 1 hour
        return {
          success: true,
          data: enriched,
          message: "Author analytics retrieved successfully",
        };
      }

      return {
        success: true,
        data: null,
        message: "No analytics data found",
      };
    } catch (error) {
      this.logger.error(`Failed to get author analytics for author ${query.authorId}`, error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get author analytics",
      };
    }
  }

  async getAuthorRevenue(query: AuthorRevenueQueryDto) {
    try {
      // Get revenue data from monetization service
      if (!this.monetizationService) {
        return {
          success: false,
          data: null,
          message: "Monetization service unavailable",
        };
      }

      // For now, get from database (will be enriched with monetization-service data)
      const result = await this.databaseService.createData<any[]>(11, "spAuthorRevenue_Get", [
        ["AuthorId", query.authorId],
        ["StoryId", query.storyId || 0],
        ["TimeRange", query.timeRange || "all-time"],
      ]);

      const revenue = Array.isArray(result) ? result[0] : null;

      return {
        success: true,
        data: revenue,
        message: "Author revenue retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get author revenue",
      };
    }
  }

  async getAuthorEngagement(query: AuthorEngagementQueryDto) {
    try {
      // Get engagement data from community service
      const result = await this.databaseService.createData<any[]>(11, "spAuthorEngagement_Get", [
        ["AuthorId", query.authorId],
        ["StoryId", query.storyId || 0],
      ]);

      const engagement = Array.isArray(result) ? result[0] : null;

      // Enrich with community service data if available
      if (this.communityService && query.storyId) {
        try {
          const votes = (await lastValueFrom(
            this.communityService.GetStoryVotes({ storyId: query.storyId })
          ).catch(() => null)) as any;
          const comments = (await lastValueFrom(
            this.communityService.GetStoryComments({ storyId: query.storyId })
          ).catch(() => null)) as any;

          if (engagement) {
            engagement.votes = votes?.data || engagement.votes || 0;
            engagement.comments = comments?.data?.length || engagement.comments || 0;
          }
        } catch (error) {
          this.logger.warn("Failed to enrich engagement data from community service", error);
        }
      }

      return {
        success: true,
        data: engagement,
        message: "Author engagement retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get author engagement",
      };
    }
  }

  async getReaderInsights(query: ReaderInsightsQueryDto) {
    try {
      // Get reader behavior insights from users service
      const result = await this.databaseService.createData<any[]>(11, "spReaderInsights_Get", [
        ["AuthorId", query.authorId],
        ["StoryId", query.storyId || 0],
      ]);

      const insights = Array.isArray(result) ? result[0] : null;

      // Enrich with users service data if available
      if (this.usersService && query.storyId) {
        try {
          const behavior = (await lastValueFrom(
            this.usersService.GetReadingBehavior({ storyId: query.storyId })
          ).catch(() => null)) as any;

          if (insights && behavior?.data) {
            insights.readingPatterns = behavior.data.readingPatterns || insights.readingPatterns;
            insights.dropOffPoints = behavior.data.dropOffPoints || insights.dropOffPoints;
            insights.completionRate = behavior.data.completionRate || insights.completionRate;
          }
        } catch (error) {
          this.logger.warn("Failed to enrich insights from users service", error);
        }
      }

      return {
        success: true,
        data: insights,
        message: "Reader insights retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get reader insights",
      };
    }
  }

  private async enrichAnalytics(analytics: any, query: AuthorAnalyticsQueryDto) {
    // Enrich analytics with data from other services
    const enriched = { ...analytics };

    // Add revenue data
    const revenue = await this.getAuthorRevenue(query);
    if (revenue.success && revenue.data) {
      enriched.revenue = revenue.data;
    }

    // Add engagement data
    const engagement = await this.getAuthorEngagement(query);
    if (engagement.success && engagement.data) {
      enriched.engagement = engagement.data;
    }

    return enriched;
  }
}
