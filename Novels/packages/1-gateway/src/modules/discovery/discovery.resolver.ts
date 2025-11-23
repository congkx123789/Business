import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { DiscoveryService } from "./discovery.service";

@Resolver("Discovery")
@UseGuards(JwtAuthGuard)
export class DiscoveryResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Query("rankings")
  rankings(
    @Args("type") type?: string,
    @Args("genre") genre?: string,
    @Args("timeRange") timeRange?: string,
  ) {
    return this.discoveryService.getRankings({ type, genre, timeRange });
  }

  @Query("editorPicks")
  editorPicks(
    @Args("limit") limit?: number,
    @Args("genre") genre?: string,
  ) {
    return this.discoveryService.getEditorPicks({ limit, genre });
  }

  @Query("genres")
  genres() {
    return this.discoveryService.getGenres();
  }

  @Query("genreStories")
  genreStories(
    @Args("genreId") genreId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
    @Args("sort") sort?: string,
    @Args("filters") filters?: string,
  ) {
    return this.discoveryService.getGenreStories({
      genreId,
      page,
      limit,
      sort,
      filters,
    });
  }

  @Query("storefront")
  storefront() {
    return this.discoveryService.getStorefront();
  }

  @Query("search")
  search(
    @Args("query") query: string,
    @Args("type") type?: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.discoveryService.searchStories({
      query,
      type,
      page,
      limit,
    });
  }
}


