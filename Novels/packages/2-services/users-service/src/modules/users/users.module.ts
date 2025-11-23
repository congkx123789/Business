import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthModule } from "../auth/auth.module";
import { ReadingPreferencesModule } from "../reading-preferences/reading-preferences.module";
import { BookmarksModule } from "../bookmarks/bookmarks.module";
import { AnnotationsModule } from "../annotations/annotations.module";
import { LibraryModule } from "../library/library.module";
import { BookshelfModule } from "../bookshelf/bookshelf.module";
import { WishlistModule } from "../wishlist/wishlist.module";
import { ReadingProgressModule } from "../reading-progress/reading-progress.module";
import { GamificationModule } from "../gamification/gamification.module";
import { DesktopPreferencesModule } from "../desktop-preferences/desktop-preferences.module";
import { UserBehaviorModule } from "../user-behavior/user-behavior.module";
import { LibraryAutoOrganizationModule } from "../library-auto-organization/library-auto-organization.module";
import { LibraryAdvancedOrganizationModule } from "../library-advanced-organization/library-advanced-organization.module";

@Module({
  imports: [
    AuthModule,
    ReadingPreferencesModule,
    BookmarksModule,
    AnnotationsModule,
    LibraryModule,
    BookshelfModule,
    WishlistModule,
    ReadingProgressModule,
    GamificationModule,
    DesktopPreferencesModule,
    UserBehaviorModule,
    LibraryAutoOrganizationModule,
    LibraryAdvancedOrganizationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

