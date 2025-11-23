import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService } from "../../common/database/database.service";
import { CurationQueryDto } from "./dto/curation-query.dto";

@Injectable()
export class CurationService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getEditorPicks(query: CurationQueryDto) {
    const cacheKey = this.getCacheKey(query);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const picks = await this.databaseService.createData<any[]>(11, "spEditorPicks_List", [
      ["GenreId", query.genreId ?? 0],
      ["Limit", query.limit ?? 10],
    ]);

    await this.cacheManager.set(cacheKey, picks ?? [], 1800);
    return picks ?? [];
  }

  private getCacheKey(query: CurationQueryDto) {
    const { genreId = "all", limit = 10 } = query;
    return `editor-picks:${genreId}:${limit}`;
  }
}


