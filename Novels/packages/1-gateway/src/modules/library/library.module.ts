import { Module } from "@nestjs/common";
import { UsersClientModule } from "../../clients/users-client.module";
import { LibraryController } from "./library.controller";
import { BookshelvesController } from "./bookshelves.controller";
import { WishlistController } from "./wishlist.controller";
import { ReadingProgressController } from "./reading-progress.controller";
import { LibraryResolver } from "./library.resolver";
import { LibraryService } from "./library.service";

@Module({
  imports: [UsersClientModule],
  controllers: [
    LibraryController,
    BookshelvesController,
    WishlistController,
    ReadingProgressController,
  ],
  providers: [LibraryService, LibraryResolver],
  exports: [LibraryService],
})
export class LibraryModule {}
