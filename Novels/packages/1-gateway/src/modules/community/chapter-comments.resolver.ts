import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Resolver("ChapterComments")
@UseGuards(JwtAuthGuard)
export class ChapterCommentsResolver {
  constructor(private readonly communityService: CommunityService) {}

  @Query("chapterComments")
  chapterComments(
    @Args("chapterId") chapterId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getChapterComments({
      chapterId,
      page,
      limit,
    });
  }

  @Mutation("createChapterComment")
  createChapterComment(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("chapterId") chapterId: string,
    @Args("content") content: string,
    @Args("parentCommentId") parentCommentId?: string,
  ) {
    return this.communityService.createChapterComment({
      storyId,
      chapterId,
      content,
      parentCommentId,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("replyToChapterComment")
  replyToChapterComment(
    @CurrentUser() user: any,
    @Args("parentCommentId") parentCommentId: string,
    @Args("content") content: string,
  ) {
    return this.communityService.replyToChapterComment({
      parentCommentId,
      content,
      userId: String(user.userId ?? user.id),
    });
  }
}

