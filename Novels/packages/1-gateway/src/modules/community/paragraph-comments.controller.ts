import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Controller("community/paragraph-comments")
@UseGuards(JwtAuthGuard)
export class ParagraphCommentsController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  createParagraphComment(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId: string;
      chapterId: string;
      paragraphIndex: number;
      paragraphText: string;
      content: string;
      reactionType?: string;
    },
  ) {
    return this.communityService.createParagraphComment({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get(":chapterId")
  getParagraphComments(
    @Param("chapterId") chapterId: string,
    @Query("paragraphIndex") paragraphIndex?: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getParagraphComments({
      chapterId,
      paragraphIndex: paragraphIndex !== undefined ? Number(paragraphIndex) : undefined,
      page,
      limit,
    });
  }

  @Get(":chapterId/counts")
  getParagraphCommentCounts(@Param("chapterId") chapterId: string) {
    return this.communityService.getParagraphCommentCounts(chapterId);
  }

  @Post(":commentId/like")
  likeParagraphComment(@CurrentUser() user: any, @Param("commentId") commentId: string) {
    return this.communityService.likeParagraphComment(
      commentId,
      String(user.userId ?? user.id),
    );
  }

  @Post(":commentId/reply")
  replyToParagraphComment(
    @CurrentUser() user: any,
    @Param("commentId") parentCommentId: string,
    @Body() payload: { content: string; isAuthorReply?: boolean },
  ) {
    return this.communityService.replyToParagraphComment({
      parentCommentId,
      content: payload.content,
      isAuthorReply: payload.isAuthorReply,
      userId: String(user.userId ?? user.id),
    });
  }

  @Post(":commentId/delete")
  deleteParagraphComment(@CurrentUser() user: any, @Param("commentId") commentId: string) {
    return this.communityService.deleteParagraphComment(
      commentId,
      String(user.userId ?? user.id),
    );
  }
}


