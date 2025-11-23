import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Controller("community/fan-economy")
@UseGuards(JwtAuthGuard)
export class FanEconomyController {
  constructor(private readonly communityService: CommunityService) {}

  @Post("tips")
  createTip(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string; authorId: string; amount: number; message?: string },
  ) {
    return this.communityService.createTip({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("tips")
  getTipHistory(
    @Query("storyId") storyId: string,
    @Query("authorId") authorId?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getTipHistory({
      storyId,
      authorId,
      page,
      limit,
    });
  }

  @Get("rankings")
  getFanRankings(
    @Query("storyId") storyId?: string,
    @Query("authorId") authorId?: string,
    @Query("rankingType") rankingType: string = "story",
    @Query("timeRange") timeRange: string = "all-time",
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getFanRankings({
      storyId,
      authorId,
      rankingType,
      timeRange,
      limit,
    });
  }

  @Post("monthly-votes")
  castMonthlyVote(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string; votes: number; bonusVotes?: number },
  ) {
    return this.communityService.castMonthlyVote({
      storyId: payload.storyId,
      votes: payload.votes,
      bonusVotes: payload.bonusVotes,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("monthly-votes/:storyId")
  getMonthlyVoteResults(
    @Param("storyId") storyId: string,
    @Query("year") year?: number,
    @Query("month") month?: number,
  ) {
    return this.communityService.getMonthlyVoteResults({
      storyId,
      year,
      month,
    });
  }

  @Post("author-qa")
  createAuthorQASession(
    @CurrentUser() user: any,
    @Body() payload: { authorId: string; question: string; answer?: string },
  ) {
    return this.communityService.createAuthorQASession({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Post("author-updates")
  createAuthorUpdate(
    @CurrentUser() user: any,
    @Body() payload: { authorId: string; title: string; content: string },
  ) {
    return this.communityService.createAuthorUpdate(payload);
  }

  @Get("author-interactions/:authorId")
  getAuthorInteractions(
    @Param("authorId") authorId: string,
    @Query("type") type?: "qa" | "update",
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getAuthorInteractions({
      authorId,
      type,
      limit,
    });
  }

  @Get("fan-analytics/:authorId")
  getFanAnalytics(@Param("authorId") authorId: string) {
    return this.communityService.getFanAnalytics(authorId);
  }
}


