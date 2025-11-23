import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Resolver("PlatformInteractions")
@UseGuards(JwtAuthGuard)
export class PlatformInteractionsResolver {
  constructor(private readonly communityService: CommunityService) {}

  // Polls
  @Query("polls")
  polls(@Args("storyId") storyId?: string, @Args("isActive") isActive?: boolean) {
    return this.communityService.getPolls({
      storyId,
      isActive,
    });
  }

  @Mutation("createPoll")
  createPoll(
    @CurrentUser() user: any,
    @Args("question") question: string,
    @Args("options") options: string[],
    @Args("storyId") storyId?: string,
    @Args("endsAt") endsAt?: string,
  ) {
    return this.communityService.createPoll({
      storyId,
      question,
      options,
      endsAt,
      createdBy: String(user.userId ?? user.id),
    });
  }

  @Mutation("votePoll")
  votePoll(
    @CurrentUser() user: any,
    @Args("pollId") pollId: string,
    @Args("optionId") optionId: string,
  ) {
    return this.communityService.votePoll({
      pollId,
      optionId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Query("pollResults")
  pollResults(@Args("pollId") pollId: string) {
    return this.communityService.getPollResults(pollId);
  }

  // Quizzes
  @Mutation("createQuiz")
  createQuiz(
    @CurrentUser() user: any,
    @Args("title") title: string,
    @Args("questions")
    questions: Array<{ prompt: string; options: string[]; answerIndex: number }>,
    @Args("storyId") storyId?: string,
  ) {
    return this.communityService.createQuiz({
      storyId,
      title,
      questions,
      createdBy: String(user.userId ?? user.id),
    });
  }

  @Mutation("submitQuizAnswers")
  submitQuizAnswers(
    @CurrentUser() user: any,
    @Args("quizId") quizId: string,
    @Args("answers") answers: number[],
  ) {
    return this.communityService.submitQuizAnswers({
      quizId,
      answers,
      userId: String(user.userId ?? user.id),
    });
  }
}

