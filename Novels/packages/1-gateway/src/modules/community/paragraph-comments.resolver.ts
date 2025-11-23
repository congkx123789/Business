import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Resolver("ParagraphComments")
@UseGuards(JwtAuthGuard)
export class ParagraphCommentsResolver {
  constructor(private readonly communityService: CommunityService) {}

  @Query("paragraphComments")
  paragraphComments(
    @Args("chapterId") chapterId: string,
    @Args("paragraphIndex") paragraphIndex?: number,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getParagraphComments({
      chapterId,
      paragraphIndex,
      page,
      limit,
    });
  }

  @Query("paragraphCommentCounts")
  paragraphCommentCounts(@Args("chapterId") chapterId: string) {
    return this.communityService.getParagraphCommentCounts(chapterId);
  }

  @Mutation("createParagraphComment")
  createParagraphComment(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("chapterId") chapterId: string,
    @Args("paragraphIndex") paragraphIndex: number,
    @Args("paragraphText") paragraphText: string,
    @Args("content") content: string,
    @Args("reactionType") reactionType?: string,
  ) {
    return this.communityService.createParagraphComment({
      storyId,
      chapterId,
      paragraphIndex,
      paragraphText,
      content,
      reactionType,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("likeParagraphComment")
  likeParagraphComment(@CurrentUser() user: any, @Args("commentId") commentId: string) {
    return this.communityService.likeParagraphComment(
      commentId,
      String(user.userId ?? user.id),
    );
  }

  @Mutation("replyToParagraphComment")
  replyToParagraphComment(
    @CurrentUser() user: any,
    @Args("parentCommentId") parentCommentId: string,
    @Args("content") content: string,
    @Args("isAuthorReply") isAuthorReply?: boolean,
  ) {
    return this.communityService.replyToParagraphComment({
      parentCommentId,
      content,
      isAuthorReply,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("deleteParagraphComment")
  deleteParagraphComment(@CurrentUser() user: any, @Args("commentId") commentId: string) {
    return this.communityService.deleteParagraphComment(
      commentId,
      String(user.userId ?? user.id),
    );
  }
}


