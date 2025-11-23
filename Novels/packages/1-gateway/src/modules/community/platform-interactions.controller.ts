import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Controller("community/platform")
@UseGuards(JwtAuthGuard)
export class PlatformInteractionsController {
  constructor(private readonly communityService: CommunityService) {}

  // Polls
  @Post("polls")
  createPoll(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId?: string;
      question: string;
      options: string[];
      endsAt?: string;
    },
  ) {
    return this.communityService.createPoll({
      ...payload,
      createdBy: String(user.userId ?? user.id),
    });
  }

  @Get("polls")
  getPolls(@Query("storyId") storyId?: string, @Query("isActive") isActive?: boolean) {
    return this.communityService.getPolls({
      storyId,
      isActive,
    });
  }

  @Post("polls/:pollId/vote")
  votePoll(
    @CurrentUser() user: any,
    @Param("pollId") pollId: string,
    @Body() payload: { optionId: string },
  ) {
    return this.communityService.votePoll({
      pollId,
      optionId: payload.optionId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("polls/:pollId/results")
  getPollResults(@Param("pollId") pollId: string) {
    return this.communityService.getPollResults(pollId);
  }

  // Quizzes
  @Post("quizzes")
  createQuiz(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId?: string;
      title: string;
      questions: Array<{ prompt: string; options: string[]; answerIndex: number }>;
    },
  ) {
    return this.communityService.createQuiz({
      ...payload,
      createdBy: String(user.userId ?? user.id),
    });
  }

  @Post("quizzes/:quizId/submit")
  submitQuizAnswers(
    @CurrentUser() user: any,
    @Param("quizId") quizId: string,
    @Body() payload: { answers: number[] },
  ) {
    return this.communityService.submitQuizAnswers({
      quizId,
      answers: payload.answers,
      userId: String(user.userId ?? user.id),
    });
  }
}

