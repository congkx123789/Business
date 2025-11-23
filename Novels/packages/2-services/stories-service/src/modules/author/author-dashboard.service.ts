import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService } from "../../common/database/database.service";
import { AuthorDashboardQueryDto } from "./dto/author-dashboard.dto";

@Injectable()
export class AuthorDashboardService {
  private readonly logger = new Logger(AuthorDashboardService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getAuthorDashboard(query: AuthorDashboardQueryDto) {
    const cacheKey = `author-dashboard:${query.authorId}:${query.storyId || "all"}`;

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: "Author dashboard retrieved successfully (cached)",
        };
      }

      // Get dashboard data from database
      const result = await this.databaseService.createData<any[]>(11, "spAuthor_GetDashboard", [
        ["AuthorId", query.authorId],
        ["StoryId", query.storyId || 0],
      ]);

      const dashboard = {
        success: true,
        data: Array.isArray(result) ? result[0] : {
          authorId: query.authorId,
          stories: [],
          revenue: null,
          engagement: null,
          readingBehavior: null,
          lastUpdated: new Date().toISOString(),
        },
        message: "Author dashboard retrieved successfully",
      };

      await this.cacheManager.set(cacheKey, dashboard, 3600); // Cache for 1 hour
      return dashboard;
    } catch (error) {
      this.logger.error(`Failed to get author dashboard for author ${query.authorId}`, error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get author dashboard",
      };
    }
  }
}
