import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Resolver("Privilege")
@UseGuards(JwtAuthGuard)
export class PrivilegeResolver {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Mutation("purchasePrivilege")
  purchasePrivilege(@CurrentUser() user: any, @Args("storyId") storyId: string) {
    return this.monetizationService.purchasePrivilege(
      String(user.userId ?? user.id),
      storyId,
    );
  }

  @Query("privilege")
  getPrivilege(@CurrentUser() user: any, @Args("storyId") storyId: string) {
    return this.monetizationService.checkPrivilege(
      String(user.userId ?? user.id),
      storyId,
    );
  }

  @Query("advancedChapters")
  getAdvancedChapters(@CurrentUser() user: any, @Args("storyId") storyId: string) {
    return this.monetizationService.getAdvancedChapters(
      storyId,
      String(user.userId ?? user.id),
    );
  }
}

