import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Controller("community/chapter-comments")
@UseGuards(JwtAuthGuard)
export class ChapterCommentsController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  createChapterComment(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId: string;
      chapterId: string;
      content: string;
      parentCommentId?: string;
    },
  ) {
    return this.communityService.createChapterComment({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get(":chapterId")
  getChapterComments(
    @Param("chapterId") chapterId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getChapterComments({
      chapterId,
      page,
      limit,
    });
  }

  @Post(":commentId/reply")
  replyToChapterComment(
    @CurrentUser() user: any,
    @Param("commentId") parentCommentId: string,
    @Body() payload: { content: string },
  ) {
    return this.communityService.replyToChapterComment({
      parentCommentId,
      content: payload.content,
      userId: String(user.userId ?? user.id),
    });
  }
}

