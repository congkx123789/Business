import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Controller("monetization/wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Get()
  getWallet(@CurrentUser() user: any) {
    return this.monetizationService.getWallet(String(user.userId ?? user.id));
  }

  @Post("top-up")
  topUp(@CurrentUser() user: any, @Body() payload: { amount: number }) {
    return this.monetizationService.topUp(String(user.userId ?? user.id), payload.amount);
  }

  @Get("transactions")
  getTransactions(
    @CurrentUser() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.monetizationService.getTransactions(String(user.userId ?? user.id), page, limit);
  }
}


