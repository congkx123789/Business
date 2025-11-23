import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MonetizationService } from "./monetization.service";

@Controller("api/payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly monetizationService: MonetizationService) {}

  @Post("chapters/:chapterId/purchase")
  purchaseChapter(@CurrentUser() user: any, @Param("chapterId") chapterId: string) {
    return this.monetizationService.purchaseChapter(String(user.userId ?? user.id), chapterId);
  }

  @Post("chapters/bulk")
  purchaseBulk(
    @CurrentUser() user: any,
    @Body() payload: { chapterIds: string[] },
  ) {
    return this.monetizationService.purchaseBulk(
      String(user.userId ?? user.id),
      payload.chapterIds,
    );
  }

  @Get("chapters/:chapterId/price")
  getChapterPrice(@Param("chapterId") chapterId: string) {
    return this.monetizationService.getChapterPrice(chapterId);
  }

  @Get("history")
  getPurchaseHistory(
    @CurrentUser() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.monetizationService.getPurchaseHistory(
      String(user.userId ?? user.id),
      page,
      limit,
    );
  }
}


