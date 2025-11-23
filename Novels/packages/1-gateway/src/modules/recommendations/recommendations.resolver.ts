import {
  Args,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RecommendationsService } from "./recommendations.service";

@Resolver("Recommendations")
@UseGuards(JwtAuthGuard)
export class RecommendationsResolver {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Query("recommendations")
  recommendations(
    @CurrentUser() user: any,
    @Args("limit") limit?: number,
    @Args("context") context?: string,
  ) {
    return this.recommendationsService.getRecommendations({
      userId: String(user?.userId ?? user?.id),
      limit,
      context,
    });
  }

  @Query("moodBasedRecommendations")
  moodBasedRecommendations(
    @CurrentUser() user: any,
    @Args("mood") mood?: string,
  ) {
    return this.recommendationsService.getMoodBasedRecommendations(
      String(user?.userId ?? user?.id),
      mood,
    );
  }

  @Mutation("naturalLanguageSearch")
  naturalLanguageSearch(@Args("query") query: string) {
    return this.recommendationsService.naturalLanguageSearch(query);
  }

  @Query("exploreNewTerritories")
  exploreNewTerritories(@CurrentUser() user: any) {
    return this.recommendationsService.exploreNewTerritories(
      String(user?.userId ?? user?.id),
    );
  }

  @Query("similarStories")
  similarStories(
    @Args("storyId") storyId: string,
    @Args("limit") limit?: number,
  ) {
    return this.recommendationsService.getSimilarStories(storyId, limit);
  }

  @Query("trendingStories")
  trendingStories(
    @Args("genre") genre?: string,
    @Args("timeRange") timeRange?: string,
  ) {
    return this.recommendationsService.getTrendingStories({
      genre,
      timeRange,
    });
  }

  @Query("recommendationExplanation")
  recommendationExplanation(
    @Args("storyId") storyId: string,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.explainRecommendation(
      storyId,
      String(user?.userId ?? user?.id),
    );
  }
}


