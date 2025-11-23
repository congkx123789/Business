import { Controller, Get, Post, Delete, Param, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BookmarksService } from "./bookmarks.service";
import { ParseIntPipe } from "../../common/pipes/parse-int.pipe";

@Controller("bookmarks")
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  getUserBookmarks(@Req() req: any, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.bookmarksService.getUserBookmarks(
      Number(req.user.userId),
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Post(":bookId")
  createBookmark(
    @Req() req: any,
    @Param("bookId", ParseIntPipe) bookId: number,
    @Query("chapterId") chapterId?: number
  ) {
    return this.bookmarksService.createBookmark(
      Number(req.user.userId),
      Number(bookId),
      chapterId ? Number(chapterId) : undefined,
    );
  }

  @Delete(":id")
  deleteBookmark(@Param("id", ParseIntPipe) id: number) {
    return this.bookmarksService.deleteBookmark(Number(id));
  }
}
