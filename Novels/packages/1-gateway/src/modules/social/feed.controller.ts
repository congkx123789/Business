import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Controller("social/feed")
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  getFeed(
    @CurrentUser() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.socialService.getFeed(String(user.userId ?? user.id), page, limit);
  }

  @Get("user/:userId")
  getUserPosts(
    @Param("userId") userId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.socialService.getUserPosts(userId, page, limit);
  }

  @Get("groups/:groupId/posts")
  getGroupPosts(
    @Param("groupId") groupId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.socialService.getGroupPosts(groupId, page, limit);
  }
}


