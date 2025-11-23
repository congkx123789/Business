import { Injectable } from "@nestjs/common";
import { RankingService } from "./ranking.service";
import { CurationService } from "./curation.service";
import { GenresService } from "../genres/genres.service";
import { GenreBrowsingService } from "../genres/genre-browsing.service";
import { RankingQueryDto } from "./dto/ranking-query.dto";
import { CurationQueryDto } from "./dto/curation-query.dto";

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly rankingService: RankingService,
    private readonly curationService: CurationService,
    private readonly genresService: GenresService,
    private readonly genreBrowsingService: GenreBrowsingService
  ) {}

  getRankings(query: RankingQueryDto) {
    return this.rankingService.getRankings(query);
  }

  getEditorPicks(query: CurationQueryDto) {
    return this.curationService.getEditorPicks(query);
  }

  async getGenreLandingPage(genreId: number) {
    return this.genreBrowsingService.getGenreLandingPage(genreId);
  }

  async getStoriesByGenre(genreId: number, page: number, limit: number) {
    return this.genreBrowsingService.getStoriesByGenre(genreId, page, limit);
  }
}


