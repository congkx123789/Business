import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Controller("social/posts")
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  createPost(
    @CurrentUser() user: any,
    @Body()
    payload: {
      content: string;
      storyId?: string;
      groupId?: string;
      mediaUrls?: string[];
    },
  ) {
    return this.socialService.createPost({
      ...payload,
      userId: String(user.userId ?? user.id),
    });
  }

  @Delete(":postId")
  deletePost(@CurrentUser() user: any, @Param("postId") postId: string) {
    return this.socialService.deletePost(postId, String(user.userId ?? user.id));
  }

  @Post(":postId/like")
  likePost(@CurrentUser() user: any, @Param("postId") postId: string) {
    return this.socialService.likePost(postId, String(user.userId ?? user.id));
  }
}


