import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ReviewsService } from "./reviews.service";
import { ParseIntPipe } from "../../common/pipes/parse-int.pipe";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("book/:bookId")
  getBookReviews(
    @Param("bookId", ParseIntPipe) bookId: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.reviewsService.getBookReviews(bookId, page || 1, limit || 10);
  }

  @Post("book/:bookId")
  @UseGuards(JwtAuthGuard)
  createReview(
    @Req() req: any,
    @Param("bookId", ParseIntPipe) bookId: number,
    @Body() dto: { rating: number; content: string }
  ) {
    return this.reviewsService.createReview(req.user.userId, bookId, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  updateReview(@Param("id", ParseIntPipe) id: number, @Body() dto: { rating?: number; content?: string }) {
    return this.reviewsService.updateReview(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  deleteReview(@Param("id", ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(id);
  }
}
