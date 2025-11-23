import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Resolver("SocialFeed")
@UseGuards(JwtAuthGuard)
export class FeedResolver {
  constructor(private readonly socialService: SocialService) {}

  @Query("feed")
  feed(@CurrentUser() user: any, @Args("page") page?: number, @Args("limit") limit?: number) {
    return this.socialService.getFeed(String(user.userId ?? user.id), page, limit);
  }

  @Query("userPosts")
  userPosts(
    @Args("userId") userId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.socialService.getUserPosts(userId, page, limit);
  }

  @Query("groupPosts")
  groupPosts(
    @Args("groupId") groupId: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.socialService.getGroupPosts(groupId, page, limit);
  }
}


