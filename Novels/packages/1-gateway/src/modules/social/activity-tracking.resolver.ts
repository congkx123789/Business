import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Resolver("ActivityTracking")
@UseGuards(JwtAuthGuard)
export class ActivityTrackingResolver {
  constructor(private readonly socialService: SocialService) {}

  @Mutation("setReadingGoal")
  setReadingGoal(
    @CurrentUser() user: any,
    @Args("goalType") goalType: string,
    @Args("target") target: number,
    @Args("timeRange") timeRange: string,
    @Args("startDate") startDate?: string,
    @Args("endDate") endDate?: string,
  ) {
    return this.socialService.setReadingGoal({
      userId: String(user.userId ?? user.id),
      goalType,
      target,
      timeRange,
      startDate,
      endDate,
    });
  }

  @Query("readingGoals")
  readingGoals(@CurrentUser() user: any) {
    return this.socialService.getReadingGoals(String(user.userId ?? user.id));
  }

  @Query("activityFeed")
  activityFeed(
    @CurrentUser() user: any,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.socialService.getActivityFeed(String(user.userId ?? user.id), page, limit);
  }

  @Query("readingStatistics")
  readingStatistics(@CurrentUser() user: any) {
    return this.socialService.getReadingStatistics(String(user.userId ?? user.id));
  }
}


