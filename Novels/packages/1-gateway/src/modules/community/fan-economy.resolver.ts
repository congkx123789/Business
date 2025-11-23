import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Resolver("FanEconomy")
@UseGuards(JwtAuthGuard)
export class FanEconomyResolver {
  constructor(private readonly communityService: CommunityService) {}

  @Mutation("createTip")
  createTip(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("authorId") authorId: string,
    @Args("amount") amount: number,
    @Args("message") message?: string,
  ) {
    return this.communityService.createTip({
      storyId,
      authorId,
      amount,
      message,
      userId: String(user.userId ?? user.id),
    });
  }

  @Query("tipHistory")
  tipHistory(
    @Args("storyId") storyId: string,
    @Args("authorId") authorId?: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getTipHistory({
      storyId,
      authorId,
      page,
      limit,
    });
  }

  @Query("fanRankings")
  fanRankings(
    @Args("storyId") storyId?: string,
    @Args("authorId") authorId?: string,
    @Args("rankingType") rankingType: string = "story",
    @Args("timeRange") timeRange: string = "all-time",
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getFanRankings({
      storyId,
      authorId,
      rankingType,
      timeRange,
      limit,
    });
  }

  @Mutation("castMonthlyVote")
  castMonthlyVote(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("votes") votes: number,
    @Args("bonusVotes") bonusVotes?: number,
  ) {
    return this.communityService.castMonthlyVote({
      storyId,
      votes,
      bonusVotes,
      userId: String(user.userId ?? user.id),
    });
  }

  @Query("monthlyVoteResults")
  monthlyVoteResults(
    @Args("storyId") storyId: string,
    @Args("year") year?: number,
    @Args("month") month?: number,
  ) {
    return this.communityService.getMonthlyVoteResults({
      storyId,
      year,
      month,
    });
  }

  @Mutation("createAuthorQASession")
  createAuthorQASession(
    @CurrentUser() user: any,
    @Args("authorId") authorId: string,
    @Args("question") question: string,
    @Args("answer") answer?: string,
  ) {
    return this.communityService.createAuthorQASession({
      authorId,
      question,
      answer,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("createAuthorUpdate")
  createAuthorUpdate(
    @CurrentUser() user: any,
    @Args("authorId") authorId: string,
    @Args("title") title: string,
    @Args("content") content: string,
  ) {
    return this.communityService.createAuthorUpdate({
      authorId,
      title,
      content,
    });
  }

  @Query("authorInteractions")
  authorInteractions(
    @Args("authorId") authorId: string,
    @Args("type") type?: "qa" | "update",
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getAuthorInteractions({
      authorId,
      type,
      limit,
    });
  }

  @Query("fanAnalytics")
  fanAnalytics(@Args("authorId") authorId: string) {
    return this.communityService.getFanAnalytics(authorId);
  }
}


