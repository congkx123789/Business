import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { GenresService } from "../genres/genres.service";
import { DiscoveryService } from "./discovery.service";
import { RankingService } from "./ranking.service";
import { CurationService } from "./curation.service";
import { StorefrontQueryDto } from "./dto/storefront-query.dto";

@Injectable()
export class StorefrontService {
  constructor(
    private readonly genresService: GenresService,
    private readonly discoveryService: DiscoveryService,
    private readonly rankingService: RankingService,
    private readonly curationService: CurationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getStorefrontData(query: StorefrontQueryDto) {
    const cacheKey = query.userId ? `storefront:user:${query.userId}` : "storefront:public";
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const [genresResponse, editorPicks, rankings] = await Promise.all([
      this.genresService.getGenres(),
      this.curationService.getEditorPicks({ limit: 5 }),
      this.rankingService.getRankings({ rankingType: "monthly-votes", limit: 10 }),
    ]);

    const payload = {
      genres: genresResponse.data ?? [],
      editorPicks,
      rankings,
      personalized: query.userId ? await this.discoveryService.getRankings({ rankingType: "popularity", limit: 10 }) : [],
    };

    await this.cacheManager.set(cacheKey, payload, 900);
    return payload;
  }
}


