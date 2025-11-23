import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { CreateRatingDto } from "7-shared/validation/comment";
import { ParagraphCommentsService } from "../modules/comments/paragraph-comments.service";
import { ChapterCommentsService } from "../modules/comments/chapter-comments.service";
import { CommentsService } from "../modules/comments/comments.service";
import { ReviewsService } from "../modules/reviews/reviews.service";
import { ForumsService } from "../modules/forums/forums.service";
import { ForumThreadsService } from "../modules/forums/forum-threads.service";
import { PollsService } from "../modules/polls/polls.service";
import { QuizzesService } from "../modules/quizzes/quizzes.service";
import { RatingsService } from "../modules/ratings/ratings.service";

interface CreateParagraphCommentRequest {
  storyId: string;
  chapterId: string;
  userId: string;
  paragraphIndex: number;
  paragraphText: string;
  content: string;
  reactionType?: number;
}

interface GetParagraphCommentsRequest {
  chapterId: string;
  paragraphIndex?: number;
  limit?: number;
  offset?: number;
  sortBy?: number;
  includeReplies?: boolean;
}

interface GetParagraphCommentCountsRequest {
  chapterId: string;
}

interface LikeParagraphCommentRequest {
  commentId: string;
  userId: string;
  isAuthor?: boolean;
}

interface ReplyParagraphCommentRequest {
  commentId: string;
  userId: string;
  isAuthorReply?: boolean;
  content: string;
}

interface CreateChapterCommentRequest {
  storyId: string;
  chapterId: string;
  userId: string;
  content: string;
  parentId?: string;
}

interface VoteChapterCommentRequest {
  commentId: string;
  userId: string;
  value: 1 | -1;
}

interface DeleteChapterCommentRequest {
  commentId: string;
  userId: string;
}

interface CreateReviewRequest {
  storyId: string;
  userId: string;
  title?: string;
  content: string;
  plotRating?: number;
  characterRating?: number;
  writingStyleRating?: number;
  overallRating: number;
}

interface UpdateReviewRequest {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  plotRating?: number;
  characterRating?: number;
  writingStyleRating?: number;
  overallRating?: number;
}

interface DeleteReviewRequest {
  reviewId: string;
  userId: string;
}

interface VoteReviewHelpfulRequest {
  reviewId: string;
  userId: string;
}

interface CreateForumThreadRequest {
  storyId: string;
  userId: string;
  title: string;
  content: string;
  category: string;
}

interface GetForumThreadsRequest {
  storyId: string;
  category?: string;
  limit?: number;
  offset?: number;
  pinnedFirst?: boolean;
}

interface SetThreadStateRequest {
  threadId: string;
  state: boolean;
}

interface CreateForumPostRequest {
  threadId: string;
  userId: string;
  content: string;
  parentPostId?: string;
}

interface GetForumPostsRequest {
  threadId: string;
  limit?: number;
  offset?: number;
}

interface CreatePollRequest {
  storyId?: string;
  createdBy: string;
  title: string;
  description?: string;
  options: string[];
  endsAt?: string;
}

interface CreateQuizRequest {
  storyId?: string;
  createdBy: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: Array<{
    prompt: string;
    explanation?: string;
    options: Array<{ text: string; isCorrect: boolean }>;
  }>;
}

interface GetQuizzesRequest {
  storyId?: string;
  limit?: number;
  offset?: number;
}

interface SubmitQuizRequest {
  quizId: string;
  userId: string;
  timeSpent?: number;
  answers: Array<{ questionId: string; optionId: string }>;
}

interface GetQuizLeaderboardRequest {
  quizId: string;
  limit?: number;
}

interface CreateRatingRequest extends CreateRatingDto {
  userId: string;
}

interface GetRatingSummaryRequest {
  storyId: string;
}

interface GetCommentRequest {
  commentId: string;
}

interface DeleteCommentRequest {
  commentId: string;
  userId: string;
}

@Controller()
export class CommentsController {
  constructor(
    private readonly paragraphComments: ParagraphCommentsService,
    private readonly chapterComments: ChapterCommentsService,
    private readonly commentsService: CommentsService,
    private readonly reviewsService: ReviewsService,
    private readonly forumsService: ForumsService,
    private readonly forumThreadsService: ForumThreadsService,
    private readonly pollsService: PollsService,
    private readonly quizzesService: QuizzesService,
    private readonly ratingsService: RatingsService
  ) {}

  // Paragraph comments
  @GrpcMethod("CommentsService", "CreateParagraphComment")
  createParagraphComment(request: CreateParagraphCommentRequest) {
    return this.paragraphComments.create({
      storyId: request.storyId,
      chapterId: request.chapterId,
      userId: request.userId,
      paragraphIndex: request.paragraphIndex,
      paragraphText: request.paragraphText,
      content: request.content,
      reactionType: this.mapParagraphReaction(request.reactionType),
    });
  }

  @GrpcMethod("CommentsService", "GetParagraphComments")
  getParagraphComments(request: GetParagraphCommentsRequest) {
    return this.paragraphComments.list({
      chapterId: request.chapterId,
      paragraphIndex: this.resolveOptionalNumber(request.paragraphIndex),
      limit: request.limit,
      offset: request.offset,
      sortBy: this.mapParagraphSort(request.sortBy),
      includeReplies: request.includeReplies,
    });
  }

  @GrpcMethod("CommentsService", "GetParagraphCommentCounts")
  getParagraphCommentCounts(request: GetParagraphCommentCountsRequest) {
    return this.paragraphComments.countByChapter(request.chapterId);
  }

  @GrpcMethod("CommentsService", "DeleteParagraphComment")
  deleteParagraphComment(request: ModifyParagraphCommentRequest) {
    return this.paragraphComments.delete({
      commentId: request.commentId,
      userId: request.userId,
    });
  }

  @GrpcMethod("CommentsService", "LikeParagraphComment")
  likeParagraphComment(request: LikeParagraphCommentRequest) {
    return this.paragraphComments.toggleLike(request);
  }

  @GrpcMethod("CommentsService", "ReplyToParagraphComment")
  replyToParagraphComment(request: ReplyParagraphCommentRequest) {
    return this.paragraphComments.reply(request);
  }

  // Chapter comments
  @GrpcMethod("CommentsService", "CreateChapterComment")
  createChapterComment(request: CreateChapterCommentRequest) {
    return this.chapterComments.create(request);
  }

  @GrpcMethod("CommentsService", "GetChapterComments")
  getChapterComments(request: GetChapterCommentsRequest) {
    return this.chapterComments.list({
      chapterId: request.chapterId,
      limit: request.limit,
      offset: request.offset,
      sortBy: this.mapChapterSort(request.sortBy),
    });
  }

  @GrpcMethod("CommentsService", "VoteChapterComment")
  voteChapterComment(request: VoteChapterCommentRequest) {
    return this.chapterComments.vote(request.commentId, request.userId, this.normalizeVoteValue(request.value));
  }

  @GrpcMethod("CommentsService", "DeleteChapterComment")
  deleteChapterComment(request: DeleteChapterCommentRequest) {
    return this.chapterComments.delete(request.commentId, request.userId);
  }

  // Reviews
  @GrpcMethod("CommentsService", "CreateReview")
  createReview(request: CreateReviewRequest) {
    return this.reviewsService.createReview(request);
  }

  @GrpcMethod("CommentsService", "GetStoryReviews")
  getStoryReviews(request: { storyId: string; limit?: number; offset?: number }) {
    return this.reviewsService.getStoryReviews(request.storyId, request.limit, request.offset);
  }

  @GrpcMethod("CommentsService", "UpdateReview")
  updateReview(request: UpdateReviewRequest) {
    const { userId, ...changes } = request;
    return this.reviewsService.updateReview(changes, userId);
  }

  @GrpcMethod("CommentsService", "DeleteReview")
  deleteReview(request: DeleteReviewRequest) {
    return this.reviewsService.deleteReview(request.reviewId, request.userId);
  }

  @GrpcMethod("CommentsService", "VoteReviewHelpful")
  voteReviewHelpful(request: VoteReviewHelpfulRequest) {
    return this.reviewsService.markHelpful(request.reviewId, request.userId);
  }

  // Forums
  @GrpcMethod("CommentsService", "CreateForumThread")
  createForumThread(request: CreateForumThreadRequest) {
    return this.forumThreadsService.createThread(request);
  }

  @GrpcMethod("CommentsService", "GetForumThreads")
  getForumThreads(request: GetForumThreadsRequest) {
    return this.forumThreadsService.listThreads({
      storyId: request.storyId,
      category: request.category,
      limit: request.limit,
      offset: request.offset,
      pinnedFirst: this.resolveOptionalBoolean(request.pinnedFirst),
    });
  }

  @GrpcMethod("CommentsService", "SetThreadPinned")
  setThreadPinned(request: SetThreadStateRequest) {
    return this.forumThreadsService.setPinned(request.threadId, request.state);
  }

  @GrpcMethod("CommentsService", "SetThreadLocked")
  setThreadLocked(request: SetThreadStateRequest) {
    return this.forumThreadsService.setLocked(request.threadId, request.state);
  }

  @GrpcMethod("CommentsService", "CreateForumPost")
  createForumPost(request: CreateForumPostRequest) {
    return this.forumsService.createPost(request);
  }

  @GrpcMethod("CommentsService", "GetForumPosts")
  getForumPosts(request: GetForumPostsRequest) {
    return this.forumsService.listPosts(request);
  }

  // Polls
  @GrpcMethod("CommentsService", "CreatePoll")
  createPoll(request: CreatePollRequest) {
    return this.pollsService.createPoll(request);
  }

  @GrpcMethod("CommentsService", "VotePoll")
  votePoll(request: VotePollRequest) {
    return this.pollsService.vote(request);
  }

  @GrpcMethod("CommentsService", "GetPolls")
  getPolls(request: GetPollsRequest) {
    return this.pollsService.getPolls({
      storyId: request.storyId,
      activeOnly: this.resolveOptionalBoolean(request.activeOnly),
    });
  }

  @GrpcMethod("CommentsService", "GetPollResults")
  getPollResults(request: GetPollResultsRequest) {
    return this.pollsService.getPollResults(request.pollId);
  }

  // Quizzes
  @GrpcMethod("CommentsService", "CreateQuiz")
  createQuiz(request: CreateQuizRequest) {
    return this.quizzesService.createQuiz(request);
  }

  @GrpcMethod("CommentsService", "GetQuizzes")
  getQuizzes(request: GetQuizzesRequest) {
    return this.quizzesService.getQuizzes(request.storyId, request.limit, request.offset);
  }

  @GrpcMethod("CommentsService", "SubmitQuiz")
  submitQuiz(request: SubmitQuizRequest) {
    return this.quizzesService.submitQuiz(request);
  }

  @GrpcMethod("CommentsService", "GetQuizLeaderboard")
  getQuizLeaderboard(request: GetQuizLeaderboardRequest) {
    return this.quizzesService.getLeaderboard(request.quizId, request.limit);
  }

  // Ratings
  @GrpcMethod("CommentsService", "CreateRating")
  createRating(request: CreateRatingRequest) {
    return this.ratingsService.createOrUpdateRating(request);
  }

  @GrpcMethod("CommentsService", "GetRatingSummary")
  getRatingSummary(request: GetRatingSummaryRequest) {
    return this.ratingsService.getRatingSummary(request.storyId);
  }

  // Aggregated helpers
  @GrpcMethod("CommentsService", "GetCommentById")
  getCommentById(request: GetCommentRequest) {
    return this.commentsService.getCommentById(request.commentId);
  }

  @GrpcMethod("CommentsService", "DeleteComment")
  deleteComment(request: DeleteCommentRequest) {
    return this.commentsService.deleteComment(request.commentId, request.userId);
  }

  @GrpcMethod("CommentsService", "GetStoryActivityFeed")
  getStoryActivityFeed(request: GetStoryActivityFeedRequest) {
    return this.commentsService.getStoryActivityFeed(request.storyId, request.limit);
  }

  private resolveOptionalNumber(value: unknown) {
    return typeof value === "number" ? value : undefined;
  }

  private resolveOptionalBoolean(value: unknown) {
    return typeof value === "boolean" ? value : undefined;
  }

  private mapParagraphReaction(value?: number) {
    switch (value) {
      case 1:
        return "like";
      case 2:
        return "laugh";
      case 3:
        return "cry";
      case 4:
        return "angry";
      case 5:
        return "wow";
      case 6:
        return "love";
      default:
        return undefined;
    }
  }

  private mapParagraphSort(sort?: number): "newest" | "oldest" | "most-liked" {
    switch (sort) {
      case 2:
        return "oldest";
      case 3:
        return "most-liked";
      case 1:
      default:
        return "newest";
    }
  }

  private mapChapterSort(sort?: number | GetChapterCommentsRequest["sortBy"]): "newest" | "oldest" | "top" {
    if (sort === "newest" || sort === "oldest" || sort === "top") {
      return sort;
    }

    switch (sort) {
      case 2:
        return "oldest";
      case 3:
        return "top";
      case 1:
      default:
        return "newest";
    }
  }

  private normalizeVoteValue(value?: number): 1 | -1 {
    return value === -1 ? -1 : 1;
  }
}

interface ModifyParagraphCommentRequest {
  commentId: string;
  userId: string;
}

interface GetChapterCommentsRequest {
  chapterId: string;
  limit?: number;
  offset?: number;
  sortBy?: "newest" | "oldest" | "top";
}

interface GetStoryActivityFeedRequest {
  storyId: string;
  limit?: number;
}

interface VotePollRequest {
  pollId: string;
  optionId: string;
  userId: string;
}

interface GetPollResultsRequest {
  pollId: string;
}

interface GetPollsRequest {
  storyId?: string;
  activeOnly?: boolean;
}


