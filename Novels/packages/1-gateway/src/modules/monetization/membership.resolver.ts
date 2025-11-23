import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Resolver("Membership")
@UseGuards(JwtAuthGuard)
export class MembershipResolver {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Mutation("createMembership")
  createMembership(@CurrentUser() user: any, @Args("planId") planId: string) {
    return this.monetizationService.createMembership(String(user.userId ?? user.id), planId);
  }

  @Query("membership")
  getMembership(@CurrentUser() user: any) {
    return this.monetizationService.getMembership(String(user.userId ?? user.id));
  }

  @Mutation("claimDailyBonus")
  claimDailyBonus(@CurrentUser() user: any) {
    return this.monetizationService.claimDailyBonus(String(user.userId ?? user.id));
  }

  @Mutation("cancelMembership")
  cancelMembership(@CurrentUser() user: any) {
    return this.monetizationService.cancelMembership(String(user.userId ?? user.id));
  }
}

