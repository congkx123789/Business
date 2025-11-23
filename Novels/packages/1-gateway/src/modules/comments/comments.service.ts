import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  getGrpcResultOrThrow,
  getGrpcDataOrThrow,
} from "../../common/utils/grpc.util";

interface CommentsGrpcService {
  GetChapterComments(data: {
    chapterId: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<any>;
  CreateChapterComment(data: {
    storyId: string;
    chapterId: string;
    userId: string;
    content: string;
    parentId?: string;
  }): Observable<any>;
  VoteChapterComment(data: { commentId: string; userId: string; value: number }): Observable<any>;
  GetStoryReviews(data: { storyId: string; page?: number; limit?: number }): Observable<any>;
  CreateReview(data: {
    storyId: string;
    userId: string;
    title: string;
    content: string;
    plotRating?: number;
    characterRating?: number;
    writingStyleRating?: number;
    overallRating?: number;
  }): Observable<any>;
  VoteReviewHelpful(data: { reviewId: string; userId: string }): Observable<any>;
  CreateForumThread(data: {
    storyId: string;
    userId: string;
    title: string;
    content: string;
    category?: string;
  }): Observable<any>;
  GetForumThreads(data: {
    storyId: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Observable<any>;
  CreateForumPost(data: {
    threadId: string;
    userId: string;
    content: string;
    parentPostId?: string;
  }): Observable<any>;
  GetForumPosts(data: { threadId: string; page?: number; limit?: number }): Observable<any>;
}

@Injectable()
export class CommentsService implements OnModuleInit {
  private client!: CommentsGrpcService;

  constructor(@Inject("COMMENTS_SERVICE") private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.client = this.grpcClient.getService<CommentsGrpcService>("CommentsService");
  }

  getChapterComments(
    chapterId: string,
    params: { page?: number; limit?: number; sort?: string },
  ) {
    return getGrpcResultOrThrow(
      this.client.GetChapterComments({
        chapterId,
        page: params.page,
        limit: params.limit,
        sort: params.sort,
      }),
      "Failed to load chapter comments",
    );
  }

  createChapterComment(payload: {
    storyId: string;
    chapterId: string;
    content: string;
    parentId?: string;
    userId: string;
  }) {
    return getGrpcDataOrThrow(
      this.client.CreateChapterComment(payload),
      "Failed to create chapter comment",
    );
  }

  voteChapterComment(payload: { commentId: string; userId: string; value: number }) {
    return getGrpcDataOrThrow(
      this.client.VoteChapterComment(payload),
      "Failed to vote chapter comment",
    );
  }

  getStoryReviews(storyId: string, params: { page?: number; limit?: number }) {
    return getGrpcResultOrThrow(
      this.client.GetStoryReviews({ storyId, page: params.page, limit: params.limit }),
      "Failed to load reviews",
    );
  }

  createReview(payload: {
    storyId: string;
    userId: string;
    title: string;
    content: string;
    plotRating?: number;
    characterRating?: number;
    writingStyleRating?: number;
    overallRating?: number;
  }) {
    return getGrpcDataOrThrow(this.client.CreateReview(payload), "Failed to create review");
  }

  voteReviewHelpful(reviewId: string, userId: string) {
    return getGrpcDataOrThrow(
      this.client.VoteReviewHelpful({ reviewId, userId }),
      "Failed to record helpful vote",
    );
  }

  createForumThread(payload: {
    storyId: string;
    userId: string;
    title: string;
    content: string;
    category?: string;
  }) {
    return getGrpcDataOrThrow(
      this.client.CreateForumThread(payload),
      "Failed to create forum thread",
    );
  }

  getForumThreads(params: { storyId: string; category?: string; page?: number; limit?: number }) {
    return getGrpcResultOrThrow(
      this.client.GetForumThreads(params),
      "Failed to load forum threads",
    );
  }

  createForumPost(payload: {
    threadId: string;
    userId: string;
    content: string;
    parentPostId?: string;
  }) {
    return getGrpcDataOrThrow(this.client.CreateForumPost(payload), "Failed to create forum post");
  }

  getForumPosts(params: { threadId: string; page?: number; limit?: number }) {
    return getGrpcResultOrThrow(
      this.client.GetForumPosts(params),
      "Failed to load forum posts",
    );
  }
}


