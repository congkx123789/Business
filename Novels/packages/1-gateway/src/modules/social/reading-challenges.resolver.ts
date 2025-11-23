import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Resolver("ReadingChallenge")
@UseGuards(JwtAuthGuard)
export class ReadingChallengesResolver {
  constructor(private readonly socialService: SocialService) {}

  @Mutation("createReadingChallenge")
  createReadingChallenge(
    @CurrentUser() user: any,
    @Args("name") name: string,
    @Args("description") description: string,
    @Args("goal") goal: number,
    @Args("goalType") goalType: string,
    @Args("challengeType") challengeType: string,
    @Args("timeRange") timeRange: string,
    @Args("startDate") startDate?: string,
    @Args("endDate") endDate?: string,
    @Args("isPublic") isPublic?: boolean,
  ) {
    return this.socialService.createReadingChallenge({
      creatorId: String(user.userId ?? user.id),
      name,
      description,
      goal,
      goalType,
      challengeType,
      timeRange,
      startDate,
      endDate,
      isPublic,
    });
  }

  @Mutation("joinReadingChallenge")
  joinReadingChallenge(@CurrentUser() user: any, @Args("challengeId") challengeId: string) {
    return this.socialService.joinReadingChallenge(challengeId, String(user.userId ?? user.id));
  }

  @Mutation("updateChallengeProgress")
  updateChallengeProgress(
    @CurrentUser() user: any,
    @Args("challengeId") challengeId: string,
    @Args("progress") progress: number,
  ) {
    return this.socialService.updateChallengeProgress(
      challengeId,
      String(user.userId ?? user.id),
      progress,
    );
  }

  @Query("readingChallenge")
  readingChallenge(@Args("challengeId") challengeId: string) {
    return this.socialService.getReadingChallenge(challengeId);
  }

  @Query("challengeParticipants")
  challengeParticipants(@Args("challengeId") challengeId: string) {
    return this.socialService.getChallengeParticipants(challengeId);
  }
}


