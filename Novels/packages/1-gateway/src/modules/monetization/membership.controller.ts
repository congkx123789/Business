import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Controller("api/membership")
@UseGuards(JwtAuthGuard)
export class MembershipController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Post()
  createMembership(@CurrentUser() user: any, @Body() payload: { planId: string }) {
    return this.monetizationService.createMembership(
      String(user.userId ?? user.id),
      payload.planId,
    );
  }

  @Get()
  getMembership(@CurrentUser() user: any) {
    return this.monetizationService.getMembership(String(user.userId ?? user.id));
  }

  @Post("claim-daily-bonus")
  claimDailyBonus(@CurrentUser() user: any) {
    return this.monetizationService.claimDailyBonus(String(user.userId ?? user.id));
  }

  @Post("cancel")
  cancelMembership(@CurrentUser() user: any) {
    return this.monetizationService.cancelMembership(String(user.userId ?? user.id));
  }
}

