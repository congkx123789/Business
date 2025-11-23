import { Injectable } from "@nestjs/common";
import { MicroCommentsService } from "./micro/micro-comments.service";
import { MesoCommentsService } from "./meso/meso-comments.service";
import { MacroCommentsService } from "./macro/macro-comments.service";
import { PlatformInteractionsService } from "./platform/platform-interactions.service";
import { CreateParagraphCommentDto } from "./micro/dto/create-paragraph-comment.dto";
import { CreateChapterCommentDto } from "./meso/dto/create-chapter-comment.dto";
import { CreateReviewDto } from "./macro/dto/create-review.dto";
import { CreateForumPostDto } from "./macro/dto/create-forum-post.dto";
import { CreatePollDto } from "./platform/dto/create-poll.dto";
import { CreateQuizDto } from "./platform/dto/create-quiz.dto";

@Injectable()
export class InteractionsService {
  constructor(
    private readonly microCommentsService: MicroCommentsService,
    private readonly mesoCommentsService: MesoCommentsService,
    private readonly macroCommentsService: MacroCommentsService,
    private readonly platformInteractionsService: PlatformInteractionsService
  ) {}

  // Micro level (Paragraph)
  createParagraphComment(payload: CreateParagraphCommentDto) {
    return this.microCommentsService.createParagraphComment(payload);
  }

  getParagraphComments(options: {
    chapterId: string;
    paragraphIndex?: number;
    page?: number;
    limit?: number;
  }) {
    return this.microCommentsService.getParagraphComments(options);
  }

  likeParagraphComment(commentId: string, userId: string, isAuthor?: boolean) {
    return this.microCommentsService.likeParagraphComment(commentId, userId, isAuthor);
  }

  replyToParagraphComment(payload: { parentCommentId: string; userId: string; content: string; isAuthorReply?: boolean }) {
    return this.microCommentsService.replyToParagraphComment(payload);
  }

  getParagraphCommentCount(chapterId: string, paragraphIndex?: number) {
    return this.microCommentsService.getParagraphCommentCount(chapterId, paragraphIndex);
  }

  getParagraphCommentCounts(chapterId: string) {
    return this.microCommentsService.getParagraphCommentCounts(chapterId);
  }

  deleteParagraphComment(commentId: string, userId: string) {
    return this.microCommentsService.deleteParagraphComment(commentId, userId);
  }

  // Meso level (Chapter)
  createChapterComment(payload: CreateChapterCommentDto) {
    return this.mesoCommentsService.createChapterComment(payload);
  }

  getChapterComments(options: { chapterId: string; page?: number; limit?: number }) {
    return this.mesoCommentsService.getChapterComments(options);
  }

  replyToChapterComment(payload: {
    parentCommentId: string;
    userId: string;
    content: string;
    storyId?: string;
    chapterId?: string;
  }) {
    return this.mesoCommentsService.replyToChapterComment(payload);
  }

  // Macro level (Reviews/forum)
  createReview(payload: CreateReviewDto) {
    return this.macroCommentsService.createReview(payload);
  }

  getReviews(options: { storyId: string; page?: number; limit?: number }) {
    return this.macroCommentsService.getReviews(options);
  }

  markReviewHelpful(reviewId: string, userId: string) {
    return this.macroCommentsService.markReviewHelpful(reviewId, userId);
  }

  createForumPost(payload: CreateForumPostDto) {
    return this.macroCommentsService.createForumPost(payload);
  }

  getForumPosts(options: { storyId?: string; category?: string; page?: number; limit?: number }) {
    return this.macroCommentsService.getForumPosts(options);
  }

  // Platform interactions
  createPoll(payload: CreatePollDto) {
    return this.platformInteractionsService.createPoll(payload);
  }

  getPolls(options: { storyId?: string; isActive?: boolean }) {
    return this.platformInteractionsService.getPolls(options);
  }

  votePoll(payload: { pollId: string; userId: string; optionId?: string; optionIndex?: number }) {
    return this.platformInteractionsService.votePoll(payload);
  }

  getPollResults(pollId: string) {
    return this.platformInteractionsService.getPollResults(pollId);
  }

  createQuiz(payload: CreateQuizDto) {
    return this.platformInteractionsService.createQuiz(payload);
  }

  submitQuizAnswers(payload: { quizId: string; userId: string; answers: number[] }) {
    return this.platformInteractionsService.submitQuizAnswers(payload);
  }
}

