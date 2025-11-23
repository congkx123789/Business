import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LibraryService } from "./library.service";

@Controller("reading-progress")
@UseGuards(JwtAuthGuard)
export class ReadingProgressController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  getReadingProgress(
    @CurrentUser() user: any,
    @Query("storyId") storyId?: string,
  ) {
    return this.libraryService.getReadingProgress(
      Number(user.userId ?? user.id),
      storyId ? Number(storyId) : undefined,
    );
  }

  @Put()
  updateReadingProgress(
    @CurrentUser() user: any,
    @Body() payload: { storyId: number; chapterId: number; progress: number },
  ) {
    return this.libraryService.updateReadingProgress(
      Number(user.userId ?? user.id),
      {
        storyId: Number(payload.storyId),
        chapterId: Number(payload.chapterId),
        progress: Number(payload.progress),
      },
    );
  }

  @Get("sync")
  syncReadingProgress(
    @CurrentUser() user: any,
    @Query("deviceId") deviceId?: string,
  ) {
    return this.libraryService.syncReadingProgress(
      Number(user.userId ?? user.id),
      deviceId,
    );
  }

  @Post(":storyId/complete")
  markStoryCompleted(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.markStoryCompleted(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }
}


