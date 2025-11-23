import { Controller, Get, Post, Body, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ReadingProgressService } from "./reading-progress.service";
import { ParseIntPipe } from "../../common/pipes/parse-int.pipe";

@Controller("reading-progress")
@UseGuards(JwtAuthGuard)
export class ReadingProgressController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Get("book/:bookId")
  getProgress(@Req() req: any, @Param("bookId", ParseIntPipe) bookId: number) {
    return this.readingProgressService.getProgress(req.user.userId, bookId);
  }

  @Post("book/:bookId")
  updateProgress(
    @Req() req: any,
    @Param("bookId", ParseIntPipe) bookId: number,
    @Body() dto: { chapterId?: number; progress?: number }
  ) {
    return this.readingProgressService.updateProgress(req.user.userId, bookId, dto);
  }
}
