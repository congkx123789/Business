import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Controller("social/groups")
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  createGroup(
    @CurrentUser() user: any,
    @Body() payload: { name: string; description: string; coverUrl?: string },
  ) {
    return this.socialService.createGroup({
      ownerId: String(user.userId ?? user.id),
      name: payload.name,
      description: payload.description,
      coverUrl: payload.coverUrl,
    });
  }

  @Get(":groupId")
  getGroup(@Param("groupId") groupId: string) {
    return this.socialService.getGroup(groupId);
  }

  @Post(":groupId/join")
  joinGroup(@CurrentUser() user: any, @Param("groupId") groupId: string) {
    return this.socialService.joinGroup(groupId, String(user.userId ?? user.id));
  }

  @Post(":groupId/leave")
  leaveGroup(@CurrentUser() user: any, @Param("groupId") groupId: string) {
    return this.socialService.leaveGroup(groupId, String(user.userId ?? user.id));
  }
}


