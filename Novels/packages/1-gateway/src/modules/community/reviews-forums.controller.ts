import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CommunityService } from "./community.service";

@Controller("community")
@UseGuards(JwtAuthGuard)
export class ReviewsForumsController {
  constructor(private readonly communityService: CommunityService) {}

  // Reviews
  @Post("reviews")
  createReview(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId: string;
      rating: number;
      title: string;
      content: string;
      isSpoiler?: boolean;
    },
  ) {
    return this.communityService.createReview({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("reviews/:storyId")
  getReviews(
    @Param("storyId") storyId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getReviews({
      storyId,
      page,
      limit,
    });
  }

  @Post("reviews/:reviewId/helpful")
  markReviewHelpful(@CurrentUser() user: any, @Param("reviewId") reviewId: string) {
    return this.communityService.markReviewHelpful(
      reviewId,
      String(user.userId ?? user.id),
    );
  }

  // Forums
  @Post("forum-posts")
  createForumPost(
    @CurrentUser() user: any,
    @Body()
    payload: {
      storyId?: string;
      title: string;
      content: string;
      category: string;
    },
  ) {
    return this.communityService.createForumPost({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Get("forum-posts")
  getForumPosts(
    @Query("storyId") storyId?: string,
    @Query("category") category?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.communityService.getForumPosts({
      storyId,
      category,
      page,
      limit,
    });
  }
}

