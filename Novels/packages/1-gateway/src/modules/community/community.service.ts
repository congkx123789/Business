import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable, firstValueFrom } from "rxjs";

interface CommunityGrpcClient {
  CreateParagraphComment(data: any): Observable<any>;
  GetParagraphComments(data: any): Observable<any>;
  GetParagraphCommentCounts(data: any): Observable<any>;
  LikeParagraphComment(data: any): Observable<any>;
  ReplyToParagraphComment(data: any): Observable<any>;
  DeleteParagraphComment(data: any): Observable<any>;
  CreateChapterComment(data: any): Observable<any>;
  GetChapterComments(data: any): Observable<any>;
  ReplyToChapterComment(data: any): Observable<any>;
  CreateReview(data: any): Observable<any>;
  GetReviews(data: any): Observable<any>;
  MarkReviewHelpful(data: any): Observable<any>;
  CreateForumPost(data: any): Observable<any>;
  GetForumPosts(data: any): Observable<any>;
  CreatePoll(data: any): Observable<any>;
  GetPolls(data: any): Observable<any>;
  VotePoll(data: any): Observable<any>;
  GetPollResults(data: any): Observable<any>;
  CreateQuiz(data: any): Observable<any>;
  SubmitQuizAnswers(data: any): Observable<any>;
  CreateTip(data: any): Observable<any>;
  GetTipHistory(data: any): Observable<any>;
  GetFanRankings(data: any): Observable<any>;
  CastMonthlyVote(data: any): Observable<any>;
  GetMonthlyVoteResults(data: any): Observable<any>;
  CreateAuthorQASession(data: any): Observable<any>;
  CreateAuthorUpdate(data: any): Observable<any>;
  GetAuthorInteractions(data: any): Observable<any>;
  GetFanAnalytics(data: any): Observable<any>;
}

@Injectable()
export class CommunityService implements OnModuleInit {
  private client!: CommunityGrpcClient;

  constructor(@Inject("COMMUNITY_SERVICE") private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.client = this.grpcClient.getService<CommunityGrpcClient>("CommunityService");
  }

  private async callGrpc<T>(method: Observable<T>): Promise<T> {
    return firstValueFrom(method);
  }

  // Paragraph Comments (Micro Level)
  async createParagraphComment(payload: {
    storyId: string;
    chapterId: string;
    paragraphIndex: number;
    paragraphText: string;
    userId: string;
    authorId?: string;
    content: string;
    reactionType?: string;
  }) {
    return this.callGrpc(this.client.CreateParagraphComment(payload));
  }

  async getParagraphComments(params: {
    chapterId: string;
    paragraphIndex?: number;
    page?: number;
    limit?: number;
  }) {
    return this.callGrpc(
      this.client.GetParagraphComments({
        chapterId: params.chapterId,
        paragraphIndex: params.paragraphIndex ?? -1,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    );
  }

  async getParagraphCommentCounts(chapterId: string) {
    return this.callGrpc(this.client.GetParagraphCommentCounts({ chapterId }));
  }

  async likeParagraphComment(commentId: string, userId: string, isAuthor = false) {
    return this.callGrpc(this.client.LikeParagraphComment({ commentId, userId, isAuthor }));
  }

  async replyToParagraphComment(payload: {
    parentCommentId: string;
    userId: string;
    content: string;
    isAuthorReply?: boolean;
  }) {
    return this.callGrpc(this.client.ReplyToParagraphComment(payload));
  }

  async deleteParagraphComment(commentId: string, userId: string) {
    return this.callGrpc(this.client.DeleteParagraphComment({ commentId, userId }));
  }

  // Chapter Comments (Meso Level)
  async createChapterComment(payload: {
    storyId: string;
    chapterId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
  }) {
    return this.callGrpc(this.client.CreateChapterComment(payload));
  }

  async getChapterComments(params: { chapterId: string; page?: number; limit?: number }) {
    return this.callGrpc(
      this.client.GetChapterComments({
        chapterId: params.chapterId,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    );
  }

  async replyToChapterComment(payload: {
    parentCommentId: string;
    userId: string;
    content: string;
  }) {
    return this.callGrpc(this.client.ReplyToChapterComment(payload));
  }

  // Reviews & Forums (Macro Level)
  async createReview(payload: {
    storyId: string;
    userId: string;
    rating: number;
    title: string;
    content: string;
    isSpoiler?: boolean;
  }) {
    return this.callGrpc(this.client.CreateReview(payload));
  }

  async getReviews(params: { storyId: string; page?: number; limit?: number }) {
    return this.callGrpc(
      this.client.GetReviews({
        storyId: params.storyId,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    );
  }

  async markReviewHelpful(reviewId: string, userId: string) {
    return this.callGrpc(this.client.MarkReviewHelpful({ reviewId, userId }));
  }

  async createForumPost(payload: {
    userId: string;
    storyId?: string;
    title: string;
    content: string;
    category: string;
  }) {
    return this.callGrpc(this.client.CreateForumPost(payload));
  }

  async getForumPosts(params: {
    storyId?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return this.callGrpc(
      this.client.GetForumPosts({
        storyId: params.storyId ?? "",
        category: params.category ?? "",
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    );
  }

  // Platform Interactions
  async createPoll(payload: {
    storyId?: string;
    createdBy: string;
    question: string;
    options: string[];
    endsAt?: string;
  }) {
    return this.callGrpc(this.client.CreatePoll(payload));
  }

  async getPolls(params: { storyId?: string; isActive?: boolean }) {
    return this.callGrpc(this.client.GetPolls(params));
  }

  async votePoll(payload: { pollId: string; userId: string; optionId: string }) {
    return this.callGrpc(this.client.VotePoll(payload));
  }

  async getPollResults(pollId: string) {
    return this.callGrpc(this.client.GetPollResults({ pollId }));
  }

  async createQuiz(payload: {
    storyId?: string;
    createdBy: string;
    title: string;
    questions: Array<{ prompt: string; options: string[]; answerIndex: number }>;
  }) {
    return this.callGrpc(this.client.CreateQuiz(payload));
  }

  async submitQuizAnswers(payload: { quizId: string; userId: string; answers: number[] }) {
    return this.callGrpc(this.client.SubmitQuizAnswers(payload));
  }

  // Fan Economy
  async createTip(payload: {
    storyId: string;
    authorId: string;
    userId: string;
    amount: number;
    message?: string;
  }) {
    return this.callGrpc(this.client.CreateTip(payload));
  }

  async getTipHistory(params: {
    storyId: string;
    authorId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    return this.callGrpc(
      this.client.GetTipHistory({
        storyId: params.storyId,
        authorId: params.authorId ?? "",
        userId: params.userId ?? "",
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    );
  }

  async getFanRankings(params: {
    storyId?: string;
    authorId?: string;
    rankingType: string;
    timeRange: string;
    limit?: number;
  }) {
    return this.callGrpc(this.client.GetFanRankings(params));
  }

  async castMonthlyVote(payload: {
    storyId: string;
    userId: string;
    votes: number;
    bonusVotes?: number;
  }) {
    return this.callGrpc(this.client.CastMonthlyVote(payload));
  }

  async getMonthlyVoteResults(params: {
    storyId: string;
    year?: number;
    month?: number;
  }) {
    return this.callGrpc(this.client.GetMonthlyVoteResults(params));
  }

  async createAuthorQASession(payload: {
    authorId: string;
    question: string;
    answer?: string;
    userId?: string;
  }) {
    return this.callGrpc(this.client.CreateAuthorQASession(payload));
  }

  async createAuthorUpdate(payload: { authorId: string; title: string; content: string }) {
    return this.callGrpc(this.client.CreateAuthorUpdate(payload));
  }

  async getAuthorInteractions(params: {
    authorId: string;
    type?: "qa" | "update";
    limit?: number;
  }) {
    return this.callGrpc(this.client.GetAuthorInteractions(params));
  }

  async getFanAnalytics(authorId: string) {
    return this.callGrpc(this.client.GetFanAnalytics({ authorId }));
  }
}
