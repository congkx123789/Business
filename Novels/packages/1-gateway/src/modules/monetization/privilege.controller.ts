import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Controller("api/privilege")
@UseGuards(JwtAuthGuard)
export class PrivilegeController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Post("purchase")
  purchasePrivilege(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string },
  ) {
    return this.monetizationService.purchasePrivilege(
      String(user.userId ?? user.id),
      payload.storyId,
    );
  }

  @Get(":storyId")
  getPrivilegeStatus(@Param("storyId") storyId: string, @CurrentUser() user: any) {
    return this.monetizationService.checkPrivilege(
      String(user.userId ?? user.id),
      storyId,
    );
  }

  @Get(":storyId/advanced-chapters")
  getAdvancedChapters(
    @Param("storyId") storyId: string,
    @CurrentUser() user: any,
  ) {
    return this.monetizationService.getAdvancedChapters(
      storyId,
      String(user.userId ?? user.id),
    );
  }

  @Get(":storyId/:chapterId/check-access")
  checkPrivilegeAccess(
    @Param("storyId") storyId: string,
    @Param("chapterId") chapterId: string,
    @CurrentUser() user: any,
  ) {
    // Check if user has privilege and if chapter is advanced
    return this.monetizationService.checkPrivilege(
      String(user.userId ?? user.id),
      storyId,
    );
  }
}

