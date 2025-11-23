import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Resolver("Payments")
@UseGuards(JwtAuthGuard)
export class PaymentsResolver {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Mutation("purchaseChapter")
  purchaseChapter(@CurrentUser() user: any, @Args("chapterId") chapterId: string) {
    return this.monetizationService.purchaseChapter(
      String(user.userId ?? user.id),
      chapterId,
    );
  }

  @Mutation("purchaseBulk")
  purchaseBulk(@CurrentUser() user: any, @Args("chapterIds") chapterIds: string[]) {
    return this.monetizationService.purchaseBulk(
      String(user.userId ?? user.id),
      chapterIds,
    );
  }

  @Query("purchaseHistory")
  getPurchaseHistory(
    @CurrentUser() user: any,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.monetizationService.getPurchaseHistory(
      String(user.userId ?? user.id),
      page,
      limit,
    );
  }
}
