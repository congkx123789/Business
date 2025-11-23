import { Module } from "@nestjs/common";
import { BookmarksService } from "./bookmarks.service";
import { BookmarkSyncService } from "./bookmark-sync.service";

@Module({
  providers: [BookmarksService, BookmarkSyncService],
  exports: [BookmarksService, BookmarkSyncService],
})
export class BookmarksModule {}















