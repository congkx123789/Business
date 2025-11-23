import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CacheInterceptor } from "../../common/interceptors/cache.interceptor";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LibraryService } from "./library.service";

@Controller("library")
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  getLibrary(
    @CurrentUser() user: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("bookshelfId") bookshelfId?: string,
    @Query("tags") tags?: string,
    @Query("layout") layout?: string,
    @Query("sort") sort?: string,
  ) {
    return this.libraryService.getUserLibrary(Number(user.userId ?? user.id), {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      bookshelfId: bookshelfId ? Number(bookshelfId) : undefined,
      tags,
      layout,
      sort,
    });
  }

  @Post()
  addToLibrary(
    @CurrentUser() user: any,
    @Body() payload: { storyId: number },
  ) {
    return this.libraryService.addToLibrary(
      Number(user.userId ?? user.id),
      Number(payload.storyId),
    );
  }

  @Delete(":storyId")
  removeFromLibrary(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.removeFromLibrary(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Put(":libraryId")
  updateLibraryItem(
    @CurrentUser() user: any,
    @Param("libraryId") libraryId: string,
    @Body() payload: { tags?: string[]; notes?: string },
  ) {
    return this.libraryService.updateLibraryItem(
      Number(user.userId ?? user.id),
      Number(libraryId),
      payload,
    );
  }

  @Get("sync")
  syncLibrary(
    @CurrentUser() user: any,
    @Query("deviceId") deviceId?: string,
  ) {
    return this.libraryService.syncLibrary(
      Number(user.userId ?? user.id),
      deviceId,
    );
  }

  @Post(":storyId/download")
  downloadStory(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.downloadStory(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Get(":storyId/download/status")
  getDownloadStatus(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.getDownloadStatus(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Delete(":storyId/download")
  cancelDownload(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.cancelDownload(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Get("downloads")
  listDownloads(@CurrentUser() user: any) {
    return this.libraryService.listDownloads(Number(user.userId ?? user.id));
  }
}


