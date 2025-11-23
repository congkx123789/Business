import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { InteractionsService } from "../modules/interactions/interactions.service";
import { FanEconomyService } from "../modules/fan-economy/fan-economy.service";
import { CreateParagraphCommentDto } from "../modules/interactions/micro/dto/create-paragraph-comment.dto";
import { CreateChapterCommentDto } from "../modules/interactions/meso/dto/create-chapter-comment.dto";
import { ReplyChapterCommentDto } from "../modules/interactions/meso/dto/reply-comment.dto";
import { CreateReviewDto } from "../modules/interactions/macro/dto/create-review.dto";
import { CreateForumPostDto } from "../modules/interactions/macro/dto/create-forum-post.dto";
import { CreatePollDto } from "../modules/interactions/platform/dto/create-poll.dto";
import { CreateQuizDto } from "../modules/interactions/platform/dto/create-quiz.dto";
import { CreateTipDto } from "../modules/fan-economy/tipping/dto/create-tip.dto";
import { GetRankingsDto } from "../modules/fan-economy/rankings/dto/get-rankings.dto";
import { CastVoteDto } from "../modules/fan-economy/votes/dto/cast-vote.dto";
import { CreateQADto } from "../modules/fan-economy/author-fan/dto/create-qa.dto";
import { CreateAuthorUpdateDto } from "../modules/fan-economy/author-fan/dto/create-author-update.dto";

@Controller()
export class CommunityController {
  constructor(
    private readonly interactionsService: InteractionsService,
    private readonly fanEconomyService: FanEconomyService
  ) {}

  // Paragraph Comments (Micro Level - Duanping)
  @GrpcMethod("CommunityService", "CreateParagraphComment")
  async createParagraphComment(payload: CreateParagraphCommentDto) {
    const comment = await this.interactionsService.createParagraphComment(payload);
    return { comment };
  }

  @GrpcMethod("CommunityService", "GetParagraphComments")
  async getParagraphComments(data: { chapterId: string; paragraphIndex?: number; page?: number; limit?: number }) {
    const result = await this.interactionsService.getParagraphComments({
      chapterId: data.chapterId,
      paragraphIndex: data.paragraphIndex,
      page: data.page,
      limit: data.limit,
    });
    return {
      comments: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  @GrpcMethod("CommunityService", "GetParagraphCommentCounts")
  async getParagraphCommentCounts(data: { chapterId: string }) {
    const counts = await this.interactionsService.getParagraphCommentCounts(data.chapterId);
    return { counts };
  }

  @GrpcMethod("CommunityService", "DeleteParagraphComment")
  async deleteParagraphComment(data: { commentId: string; userId: string }) {
    return this.interactionsService.deleteParagraphComment(data.commentId, data.userId);
  }

  @GrpcMethod("CommunityService", "LikeParagraphComment")
  async likeParagraphComment(data: { commentId: string; userId: string; isAuthor?: boolean }) {
    return this.interactionsService.likeParagraphComment(data.commentId, data.userId, data.isAuthor);
  }

  @GrpcMethod("CommunityService", "ReplyToParagraphComment")
  async replyToParagraphComment(data: { parentCommentId: string; userId: string; content: string; isAuthorReply?: boolean }) {
    const reply = await this.interactionsService.replyToParagraphComment(data);
    return { reply };
  }

  // Chapter Comments (Meso Level - 本章说)
  @GrpcMethod("CommunityService", "CreateChapterComment")
  async createChapterComment(payload: CreateChapterCommentDto) {
    const comment = await this.interactionsService.createChapterComment(payload);
    return { comment };
  }

  @GrpcMethod("CommunityService", "GetChapterComments")
  async getChapterComments(data: { chapterId: string; page?: number; limit?: number }) {
    const result = await this.interactionsService.getChapterComments(data);
    return {
      comments: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  @GrpcMethod("CommunityService", "ReplyToChapterComment")
  async replyToChapterComment(data: ReplyChapterCommentDto) {
    const comment = await this.interactionsService.replyToChapterComment(data);
    return { comment };
  }

  // Macro Level (Reviews & Forums)
  @GrpcMethod("CommunityService", "CreateReview")
  async createReview(payload: CreateReviewDto) {
    const review = await this.interactionsService.createReview(payload);
    return { review };
  }

  @GrpcMethod("CommunityService", "GetReviews")
  async getReviews(data: { storyId: string; page?: number; limit?: number }) {
    const result = await this.interactionsService.getReviews(data);
    return {
      reviews: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  @GrpcMethod("CommunityService", "MarkReviewHelpful")
  async markReviewHelpful(data: { reviewId: string; userId: string }) {
    return this.interactionsService.markReviewHelpful(data.reviewId, data.userId);
  }

  @GrpcMethod("CommunityService", "CreateForumPost")
  async createForumPost(payload: CreateForumPostDto) {
    const post = await this.interactionsService.createForumPost(payload);
    return { post };
  }

  @GrpcMethod("CommunityService", "GetForumPosts")
  async getForumPosts(data: { storyId?: string; category?: string; page?: number; limit?: number }) {
    const result = await this.interactionsService.getForumPosts(data);
    return {
      posts: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  // Platform Interactions
  @GrpcMethod("CommunityService", "CreatePoll")
  async createPoll(payload: CreatePollDto) {
    const poll = await this.interactionsService.createPoll(payload);
    return { poll };
  }

  @GrpcMethod("CommunityService", "GetPolls")
  async getPolls(data: { storyId?: string; isActive?: boolean }) {
    const polls = await this.interactionsService.getPolls(data);
    return { polls };
  }

  @GrpcMethod("CommunityService", "VotePoll")
  async votePoll(data: { pollId: string; userId: string; optionId?: string; optionIndex?: number }) {
    return this.interactionsService.votePoll(data);
  }

  @GrpcMethod("CommunityService", "GetPollResults")
  async getPollResults(data: { pollId: string }) {
    const poll = await this.interactionsService.getPollResults(data.pollId);
    return { poll };
  }

  @GrpcMethod("CommunityService", "CreateQuiz")
  async createQuiz(payload: CreateQuizDto) {
    const quiz = await this.interactionsService.createQuiz(payload);
    return { quiz };
  }

  @GrpcMethod("CommunityService", "SubmitQuizAnswers")
  async submitQuizAnswers(data: { quizId: string; userId: string; answers: number[] }) {
    return this.interactionsService.submitQuizAnswers(data);
  }

  // Fan Economy
  @GrpcMethod("CommunityService", "CreateTip")
  async createTip(payload: CreateTipDto) {
    const tip = await this.fanEconomyService.createTip(payload);
    return { tip };
  }

  @GrpcMethod("CommunityService", "GetTipHistory")
  async getTipHistory(data: { storyId: string; authorId?: string; userId?: string; page?: number; limit?: number }) {
    const result = await this.fanEconomyService.getTipHistory(data);
    return {
      tips: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  @GrpcMethod("CommunityService", "GetFanRankings")
  async getFanRankings(data: GetRankingsDto) {
    const rankings = await this.fanEconomyService.getFanRankings(data);
    return { rankings };
  }

  @GrpcMethod("CommunityService", "CastMonthlyVote")
  async castMonthlyVote(payload: CastVoteDto) {
    const vote = await this.fanEconomyService.castMonthlyVote(payload);
    return {
      storyId: vote.storyId,
      userId: vote.userId,
      month: vote.month,
      year: vote.year,
      votes: vote.votes,
      bonusVotes: vote.bonusVotes,
    };
  }

  @GrpcMethod("CommunityService", "GetMonthlyVoteResults")
  async getMonthlyVoteResults(data: { storyId: string; year?: number; month?: number }) {
    return this.fanEconomyService.getMonthlyVoteResults(data);
  }

  @GrpcMethod("CommunityService", "CreateAuthorQASession")
  async createAuthorQASession(payload: CreateQADto) {
    const interaction = await this.fanEconomyService.createQASession(payload);
    return { interaction };
  }

  @GrpcMethod("CommunityService", "CreateAuthorUpdate")
  async createAuthorUpdate(payload: CreateAuthorUpdateDto) {
    const interaction = await this.fanEconomyService.createAuthorUpdate(payload);
    return { interaction };
  }

  @GrpcMethod("CommunityService", "GetAuthorInteractions")
  async getAuthorInteractions(data: { authorId: string; type?: "qa" | "update"; limit?: number }) {
    const interactions = await this.fanEconomyService.getAuthorInteractions(data);
    return { interactions };
  }

  @GrpcMethod("CommunityService", "GetFanAnalytics")
  async getFanAnalytics(data: { authorId: string }) {
    return this.fanEconomyService.getFanAnalytics(data.authorId);
  }
}

