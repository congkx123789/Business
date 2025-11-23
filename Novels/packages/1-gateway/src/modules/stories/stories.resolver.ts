import { Resolver, Query, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { StoriesService } from "./stories.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

/**
 * Stories GraphQL Resolver
 * GraphQL API for mobile apps (5-mobile-ios, 6-mobile-android)
 * 
 * Queries:
 * - story(id: ID!): Story
 * - stories(): [Story!]!
 */
@Resolver("Story")
@UseGuards(JwtAuthGuard)
export class StoriesResolver {
  constructor(private readonly storiesService: StoriesService) {}

  @Query("story")
  async story(@Args("id") id: string, @CurrentUser() user: any) {
    // Call gRPC client, NO business logic (Rule #4)
    return this.storiesService.getStory(id, user.userId);
  }

  @Query("stories")
  async stories(@CurrentUser() user: any) {
    // Call gRPC client, NO business logic (Rule #4)
    return this.storiesService.getStories(user.userId);
  }
}

