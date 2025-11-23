import {
  Args,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LibraryService } from "./library.service";

@Resolver()
@UseGuards(JwtAuthGuard)
export class LibraryResolver {
  constructor(private readonly libraryService: LibraryService) {}

  @Query("library")
  library(
    @CurrentUser() user: any,
    @Args("bookshelfId") bookshelfId?: number,
    @Args("tags") tags?: string,
    @Args("layout") layout?: string,
    @Args("sort") sort?: string,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.libraryService.getUserLibrary(Number(user.userId ?? user.id), {
      bookshelfId,
      tags,
      layout,
      sort,
      page,
      limit,
    });
  }

  @Mutation("addToLibrary")
  addToLibrary(@CurrentUser() user: any, @Args("storyId") storyId: number) {
    return this.libraryService.addToLibrary(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Mutation("removeFromLibrary")
  removeFromLibrary(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.removeFromLibrary(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Mutation("updateLibraryItem")
  updateLibraryItem(
    @CurrentUser() user: any,
    @Args("libraryId") libraryId: number,
    @Args("tags") tags?: string[],
    @Args("notes") notes?: string,
  ) {
    return this.libraryService.updateLibraryItem(
      Number(user.userId ?? user.id),
      Number(libraryId),
      { tags, notes },
    );
  }

  @Mutation("syncLibrary")
  syncLibrary(
    @CurrentUser() user: any,
    @Args("deviceId") deviceId?: string,
  ) {
    return this.libraryService.syncLibrary(
      Number(user.userId ?? user.id),
      deviceId,
    );
  }

  @Query("bookshelves")
  bookshelves(@CurrentUser() user: any) {
    return this.libraryService.getBookshelves(Number(user.userId ?? user.id));
  }

  @Mutation("createBookshelf")
  createBookshelf(
    @CurrentUser() user: any,
    @Args("name") name: string,
    @Args("description") description?: string,
  ) {
    return this.libraryService.createBookshelf(
      Number(user.userId ?? user.id),
      { name, description },
    );
  }

  @Mutation("updateBookshelf")
  updateBookshelf(
    @CurrentUser() user: any,
    @Args("bookshelfId") bookshelfId: number,
    @Args("name") name?: string,
    @Args("description") description?: string,
  ) {
    return this.libraryService.updateBookshelf(
      Number(user.userId ?? user.id),
      Number(bookshelfId),
      { name, description },
    );
  }

  @Mutation("deleteBookshelf")
  deleteBookshelf(
    @CurrentUser() user: any,
    @Args("bookshelfId") bookshelfId: number,
  ) {
    return this.libraryService.deleteBookshelf(
      Number(user.userId ?? user.id),
      Number(bookshelfId),
    );
  }

  @Mutation("addToBookshelf")
  addToBookshelf(
    @CurrentUser() user: any,
    @Args("bookshelfId") bookshelfId: number,
    @Args("libraryId") libraryId: number,
  ) {
    return this.libraryService.addToBookshelf(
      Number(user.userId ?? user.id),
      Number(bookshelfId),
      Number(libraryId),
    );
  }

  @Mutation("removeFromBookshelf")
  removeFromBookshelf(
    @CurrentUser() user: any,
    @Args("bookshelfId") bookshelfId: number,
    @Args("libraryId") libraryId: number,
  ) {
    return this.libraryService.removeFromBookshelf(
      Number(user.userId ?? user.id),
      Number(bookshelfId),
      Number(libraryId),
    );
  }

  @Mutation("reorderBookshelf")
  reorderBookshelf(
    @CurrentUser() user: any,
    @Args("bookshelfId") bookshelfId: number,
    @Args("items") items: Array<{ libraryId: number; position: number }>,
  ) {
    return this.libraryService.reorderBookshelf(
      Number(user.userId ?? user.id),
      Number(bookshelfId),
      items ?? [],
    );
  }

  @Query("wishlist")
  wishlist(@CurrentUser() user: any) {
    return this.libraryService.getWishlist(Number(user.userId ?? user.id));
  }

  @Mutation("addToWishlist")
  addToWishlist(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
    @Args("priority") priority?: number,
    @Args("notes") notes?: string,
  ) {
    return this.libraryService.addToWishlist(Number(user.userId ?? user.id), {
      storyId: Number(storyId),
      priority,
      notes,
    });
  }

  @Mutation("removeFromWishlist")
  removeFromWishlist(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.removeFromWishlist(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Mutation("moveWishlistToLibrary")
  moveWishlistToLibrary(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.moveWishlistToLibrary(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Query("readingProgress")
  readingProgress(
    @CurrentUser() user: any,
    @Args("storyId") storyId?: number,
  ) {
    return this.libraryService.getReadingProgress(
      Number(user.userId ?? user.id),
      storyId ? Number(storyId) : undefined,
    );
  }

  @Mutation("updateReadingProgress")
  updateReadingProgress(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
    @Args("chapterId") chapterId: number,
    @Args("progress") progress: number,
  ) {
    return this.libraryService.updateReadingProgress(
      Number(user.userId ?? user.id),
      {
        storyId: Number(storyId),
        chapterId: Number(chapterId),
        progress: Number(progress),
      },
    );
  }

  @Mutation("syncReadingProgress")
  syncReadingProgress(
    @CurrentUser() user: any,
    @Args("deviceId") deviceId?: string,
  ) {
    return this.libraryService.syncReadingProgress(
      Number(user.userId ?? user.id),
      deviceId,
    );
  }

  @Mutation("markStoryCompleted")
  markStoryCompleted(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.markStoryCompleted(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Mutation("downloadStory")
  downloadStory(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.downloadStory(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Query("downloadStatus")
  downloadStatus(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.getDownloadStatus(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Mutation("cancelDownload")
  cancelDownload(
    @CurrentUser() user: any,
    @Args("storyId") storyId: number,
  ) {
    return this.libraryService.cancelDownload(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Query("downloadedStories")
  downloadedStories(@CurrentUser() user: any) {
    return this.libraryService.listDownloads(Number(user.userId ?? user.id));
  }
}


