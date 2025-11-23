import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService } from "../../common/database/database.service";
import { RankingQueryDto } from "./dto/ranking-query.dto";

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getRankings(query: RankingQueryDto) {
    const cacheKey = this.getCacheKey(query);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const rankings = await this.databaseService.createData<any[]>(11, "spRankings_GetByType", [
        ["RankingType", query.rankingType],
        ["GenreId", query.genreId ?? 0],
        ["TimeRange", query.timeRange ?? "monthly"],
        ["Limit", query.limit ?? 20],
      ]);

      await this.cacheManager.set(cacheKey, rankings ?? [], 3600);
      return rankings ?? [];
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get rankings";
      if (message.includes("spRankings_GetByType")) {
        this.logger.warn("Ranking stored procedure missing - returning empty results");
        return [];
      }
      throw error;
    }
  }

  private getCacheKey(query: RankingQueryDto) {
    const { rankingType, genreId = "all", timeRange = "monthly", limit = 20 } = query;
    return `ranking:${rankingType}:${genreId}:${timeRange}:${limit}`;
  }
}


