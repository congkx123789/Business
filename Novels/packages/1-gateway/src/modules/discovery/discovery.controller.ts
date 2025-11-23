import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "../../common/interceptors/cache.interceptor";
import { DiscoveryService } from "./discovery.service";

@Controller()
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("rankings")
  @UseInterceptors(CacheInterceptor)
  getRankings(
    @Query("type") type?: string,
    @Query("genre") genre?: string,
    @Query("timeRange") timeRange?: string,
  ) {
    return this.discoveryService.getRankings({ type, genre, timeRange });
  }

  @Get("editor-picks")
  @UseInterceptors(CacheInterceptor)
  getEditorPicks(
    @Query("limit") limit?: number,
    @Query("genre") genre?: string,
  ) {
    return this.discoveryService.getEditorPicks({
      limit: limit ? Number(limit) : undefined,
      genre,
    });
  }

  @Get("genres")
  @UseInterceptors(CacheInterceptor)
  getGenres() {
    return this.discoveryService.getGenres();
  }

  @Get("genres/:genreId/stories")
  @UseInterceptors(CacheInterceptor)
  getGenreStories(
    @Param("genreId") genreId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("sort") sort?: string,
    @Query("filters") filters?: string,
  ) {
    return this.discoveryService.getGenreStories({
      genreId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort,
      filters,
    });
  }

  @Get("storefront")
  getStorefront() {
    return this.discoveryService.getStorefront();
  }

  @Get("search")
  search(
    @Query("q") query: string,
    @Query("type") type?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.discoveryService.searchStories({
      query,
      type,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
