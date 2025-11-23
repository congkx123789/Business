import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommentsService } from "./comments.service";

@Resolver("Comments")
@UseGuards(JwtAuthGuard)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query("chapterComments")
  chapterComments(
    @Args("chapterId") chapterId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
    @Args("sort") sort?: string,
  ) {
    return this.commentsService.getChapterComments(chapterId, { page, limit, sort });
  }

  @Mutation("createChapterComment")
  createChapterComment(
    @CurrentUser() user: any,
    @Args("chapterId") chapterId: string,
    @Args("storyId") storyId: string,
    @Args("content") content: string,
    @Args("parentId") parentId?: string,
  ) {
    return this.commentsService.createChapterComment({
      storyId,
      chapterId,
      content,
      parentId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("voteChapterComment")
  voteChapterComment(
    @CurrentUser() user: any,
    @Args("commentId") commentId: string,
    @Args("value") value: number,
  ) {
    return this.commentsService.voteChapterComment({
      commentId,
      value,
      userId: String(user.userId ?? user.id),
    });
  }

  @Query("reviews")
  reviews(
    @Args("storyId") storyId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.commentsService.getStoryReviews(storyId, { page, limit });
  }

  @Mutation("createReview")
  createReview(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("title") title: string,
    @Args("content") content: string,
    @Args("plotRating") plotRating?: number,
    @Args("characterRating") characterRating?: number,
    @Args("writingStyleRating") writingStyleRating?: number,
    @Args("overallRating") overallRating?: number,
  ) {
    return this.commentsService.createReview({
      storyId,
      title,
      content,
      plotRating,
      characterRating,
      writingStyleRating,
      overallRating,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("createForumThread")
  createForumThread(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("title") title: string,
    @Args("content") content: string,
    @Args("category") category?: string,
  ) {
    return this.commentsService.createForumThread({
      storyId,
      title,
      content,
      category,
      userId: String(user.userId ?? user.id),
    });
  }

  @Query("forumThreads")
  forumThreads(
    @Args("storyId") storyId: string,
    @Args("category") category?: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.commentsService.getForumThreads({ storyId, category, page, limit });
  }

  @Mutation("createForumPost")
  createForumPost(
    @CurrentUser() user: any,
    @Args("threadId") threadId: string,
    @Args("content") content: string,
    @Args("parentPostId") parentPostId?: string,
  ) {
    return this.commentsService.createForumPost({
      threadId,
      content,
      parentPostId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Query("forumPosts")
  forumPosts(
    @Args("threadId") threadId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.commentsService.getForumPosts({ threadId, page, limit });
  }
}


