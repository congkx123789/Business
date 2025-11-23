import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RecommendationsService } from "./recommendations.service";

@Controller("recommendations")
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  getRecommendations(
    @CurrentUser() user: any,
    @Query("limit") limit?: number,
    @Query("context") context?: string,
  ) {
    return this.recommendationsService.getRecommendations({
      userId: String(user?.userId ?? user?.id),
      limit: limit ? Number(limit) : undefined,
      context,
    });
  }

  @Get("mood-based")
  getMoodBasedRecommendations(
    @CurrentUser() user: any,
    @Query("mood") mood?: string,
  ) {
    return this.recommendationsService.getMoodBasedRecommendations(
      String(user?.userId ?? user?.id),
      mood,
    );
  }

  @Post("natural-language-search")
  naturalLanguageSearch(@Body() payload: { query: string }) {
    return this.recommendationsService.naturalLanguageSearch(payload.query);
  }

  @Get("explore-new-territories")
  exploreNewTerritories(@CurrentUser() user: any) {
    return this.recommendationsService.exploreNewTerritories(
      String(user?.userId ?? user?.id),
    );
  }

  @Get("stories/:storyId/similar")
  getSimilarStories(
    @Param("storyId") storyId: string,
    @Query("limit") limit?: number,
  ) {
    return this.recommendationsService.getSimilarStories(
      storyId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get("trending")
  getTrendingStories(
    @Query("genre") genre?: string,
    @Query("timeRange") timeRange?: string,
  ) {
    return this.recommendationsService.getTrendingStories({
      genre,
      timeRange,
    });
  }

  @Get(":storyId/explain")
  explainRecommendation(
    @Param("storyId") storyId: string,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.explainRecommendation(
      storyId,
      String(user?.userId ?? user?.id),
    );
  }
}

