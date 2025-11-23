import { Module } from "@nestjs/common";
import { CommentsClientModule } from "../../clients/comments-client.module";
import { BookmarksController } from "./bookmarks.controller";
import { BookmarksResolver } from "./bookmarks.resolver";
import { BookmarksService } from "./bookmarks.service";

@Module({
  imports: [CommentsClientModule],
  controllers: [BookmarksController],
  providers: [BookmarksService, BookmarksResolver],
})
export class BookmarksModule {}
