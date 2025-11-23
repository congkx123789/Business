import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Resolver("ReviewsForums")
@UseGuards(JwtAuthGuard)
export class ReviewsForumsResolver {
  constructor(private readonly communityService: CommunityService) {}

  // Reviews
  @Query("reviews")
  reviews(
    @Args("storyId") storyId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getReviews({
      storyId,
      page,
      limit,
    });
  }

  @Mutation("createReview")
  createReview(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("rating") rating: number,
    @Args("title") title: string,
    @Args("content") content: string,
    @Args("isSpoiler") isSpoiler?: boolean,
  ) {
    return this.communityService.createReview({
      storyId,
      rating,
      title,
      content,
      isSpoiler,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("markReviewHelpful")
  markReviewHelpful(@CurrentUser() user: any, @Args("reviewId") reviewId: string) {
    return this.communityService.markReviewHelpful(
      reviewId,
      String(user.userId ?? user.id),
    );
  }

  // Forums
  @Query("forumPosts")
  forumPosts(
    @Args("storyId") storyId?: string,
    @Args("category") category?: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.communityService.getForumPosts({
      storyId,
      category,
      page,
      limit,
    });
  }

  @Mutation("createForumPost")
  createForumPost(
    @CurrentUser() user: any,
    @Args("title") title: string,
    @Args("content") content: string,
    @Args("category") category: string,
    @Args("storyId") storyId?: string,
  ) {
    return this.communityService.createForumPost({
      storyId,
      title,
      content,
      category,
      userId: String(user.userId ?? user.id),
    });
  }
}

