import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Controller("social/activity")
@UseGuards(JwtAuthGuard)
export class ActivityTrackingController {
  constructor(private readonly socialService: SocialService) {}

  @Post("goals")
  setReadingGoal(
    @CurrentUser() user: any,
    @Body()
    payload: {
      goalType: string;
      target: number;
      timeRange: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.socialService.setReadingGoal({
      userId: String(user.userId ?? user.id),
      ...payload,
    });
  }

  @Get("goals")
  getReadingGoals(@CurrentUser() user: any) {
    return this.socialService.getReadingGoals(String(user.userId ?? user.id));
  }

  @Get("feed")
  getActivityFeed(
    @CurrentUser() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.socialService.getActivityFeed(String(user.userId ?? user.id), page, limit);
  }

  @Get("statistics")
  getStatistics(@CurrentUser() user: any) {
    return this.socialService.getReadingStatistics(String(user.userId ?? user.id));
  }
}


