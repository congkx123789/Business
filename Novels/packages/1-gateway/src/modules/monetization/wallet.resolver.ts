import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Resolver("Wallet")
@UseGuards(JwtAuthGuard)
export class WalletResolver {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Query("wallet")
  wallet(@CurrentUser() user: any) {
    return this.monetizationService.getWallet(String(user.userId ?? user.id));
  }

  @Query("walletTransactions")
  walletTransactions(
    @CurrentUser() user: any,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.monetizationService.getTransactions(String(user.userId ?? user.id), page, limit);
  }

  @Mutation("topUpWallet")
  topUpWallet(@CurrentUser() user: any, @Args("amount") amount: number) {
    return this.monetizationService.topUp(String(user.userId ?? user.id), amount);
  }
}


