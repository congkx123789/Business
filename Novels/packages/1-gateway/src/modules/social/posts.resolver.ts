import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Resolver("SocialPost")
@UseGuards(JwtAuthGuard)
export class PostsResolver {
  constructor(private readonly socialService: SocialService) {}

  @Mutation("createPost")
  createPost(
    @CurrentUser() user: any,
    @Args("content") content: string,
    @Args("storyId") storyId?: string,
    @Args("groupId") groupId?: string,
    @Args("mediaUrls", { type: () => [String], nullable: true }) mediaUrls?: string[],
  ) {
    return this.socialService.createPost({
      content,
      storyId,
      groupId,
      mediaUrls,
      userId: String(user.userId ?? user.id),
    });
  }

  @Mutation("deletePost")
  deletePost(@CurrentUser() user: any, @Args("postId") postId: string) {
    return this.socialService.deletePost(postId, String(user.userId ?? user.id));
  }

  @Mutation("likePost")
  likePost(@CurrentUser() user: any, @Args("postId") postId: string) {
    return this.socialService.likePost(postId, String(user.userId ?? user.id));
  }
}


