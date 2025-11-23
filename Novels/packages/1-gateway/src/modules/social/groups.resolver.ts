import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Resolver("SocialGroup")
@UseGuards(JwtAuthGuard)
export class GroupsResolver {
  constructor(private readonly socialService: SocialService) {}

  @Mutation("createGroup")
  createGroup(
    @CurrentUser() user: any,
    @Args("name") name: string,
    @Args("description") description: string,
    @Args("coverUrl") coverUrl?: string,
  ) {
    return this.socialService.createGroup({
      ownerId: String(user.userId ?? user.id),
      name,
      description,
      coverUrl,
    });
  }

  @Query("group")
  group(@Args("groupId") groupId: string) {
    return this.socialService.getGroup(groupId);
  }

  @Mutation("joinGroup")
  joinGroup(@CurrentUser() user: any, @Args("groupId") groupId: string) {
    return this.socialService.joinGroup(groupId, String(user.userId ?? user.id));
  }

  @Mutation("leaveGroup")
  leaveGroup(@CurrentUser() user: any, @Args("groupId") groupId: string) {
    return this.socialService.leaveGroup(groupId, String(user.userId ?? user.id));
  }
}


