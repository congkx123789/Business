import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommentsService } from "./comments.service";

@Controller("comments")
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get("chapters/:chapterId")
  getChapterComments(
    @Param("chapterId") chapterId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("sort") sort?: string,
  ) {
    return this.commentsService.getChapterComments(chapterId, {
      page,
      limit,
      sort,
    });
  }

  @Post("chapters/:chapterId")
  createChapterComment(
    @CurrentUser() user: any,
    @Param("chapterId") chapterId: string,
    @Body() payload: { storyId: string; content: string; parentId?: string },
  ) {
    return this.commentsService.createChapterComment({
      storyId: payload.storyId,
      chapterId,
      content: payload.content,
      parentId: payload.parentId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Post("chapters/:commentId/vote")
  voteChapterComment(
    @CurrentUser() user: any,
    @Param("commentId") commentId: string,
    @Body() payload: { value: number },
  ) {
    return this.commentsService.voteChapterComment({
      commentId,
      value: payload.value,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("reviews/:storyId")
  getStoryReviews(
    @Param("storyId") storyId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.commentsService.getStoryReviews(storyId, { page, limit });
  }

  @Post("reviews")
  createReview(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId: string;
      title: string;
      content: string;
      plotRating?: number;
      characterRating?: number;
      writingStyleRating?: number;
      overallRating?: number;
    },
  ) {
    return this.commentsService.createReview({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Post("reviews/:reviewId/helpful")
  voteReviewHelpful(
    @CurrentUser() user: any,
    @Param("reviewId") reviewId: string,
  ) {
    return this.commentsService.voteReviewHelpful(reviewId, String(user.userId ?? user.id));
  }

  @Post("forums/threads")
  createForumThread(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string; title: string; content: string; category?: string },
  ) {
    return this.commentsService.createForumThread({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("forums/threads/:storyId")
  getForumThreads(
    @Param("storyId") storyId: string,
    @Query("category") category?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.commentsService.getForumThreads({
      storyId,
      category,
      page,
      limit,
    });
  }

  @Post("forums/threads/:threadId/posts")
  createForumPost(
    @CurrentUser() user: any,
    @Param("threadId") threadId: string,
    @Body() payload: { content: string; parentPostId?: string },
  ) {
    return this.commentsService.createForumPost({
      threadId,
      content: payload.content,
      parentPostId: payload.parentPostId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("forums/threads/:threadId/posts")
  getForumPosts(
    @Param("threadId") threadId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.commentsService.getForumPosts({ threadId, page, limit });
  }
}


