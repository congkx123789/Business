import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Controller("social/reading-challenges")
@UseGuards(JwtAuthGuard)
export class ReadingChallengesController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  createChallenge(
    @CurrentUser() user: any,
    @Body()
    payload: {
      name: string;
      description: string;
      goal: number;
      goalType: string;
      challengeType: string;
      timeRange: string;
      startDate?: string;
      endDate?: string;
      isPublic?: boolean;
    },
  ) {
    return this.socialService.createReadingChallenge({
      creatorId: String(user.userId ?? user.id),
      ...payload,
    });
  }

  @Post(":challengeId/join")
  joinChallenge(@CurrentUser() user: any, @Param("challengeId") challengeId: string) {
    return this.socialService.joinReadingChallenge(challengeId, String(user.userId ?? user.id));
  }

  @Post(":challengeId/progress")
  updateProgress(
    @CurrentUser() user: any,
    @Param("challengeId") challengeId: string,
    @Body() payload: { progress: number },
  ) {
    return this.socialService.updateChallengeProgress(
      challengeId,
      String(user.userId ?? user.id),
      payload.progress,
    );
  }

  @Get(":challengeId")
  getChallenge(@Param("challengeId") challengeId: string) {
    return this.socialService.getReadingChallenge(challengeId);
  }

  @Get(":challengeId/participants")
  getParticipants(@Param("challengeId") challengeId: string) {
    return this.socialService.getChallengeParticipants(challengeId);
  }
}


