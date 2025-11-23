import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { BookmarksService } from "./bookmarks.service";

@Resolver("Bookmark")
@UseGuards(JwtAuthGuard)
export class BookmarksResolver {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Query("bookmarks")
  bookmarks(
    @CurrentUser() user: any,
    @Args("page") page?: number,
    @Args("limit") limit?: number,
  ) {
    return this.bookmarksService.getUserBookmarks(
      Number(user?.userId ?? user?.id),
      page,
      limit,
    );
  }

  @Mutation("createBookmark")
  createBookmark(
    @CurrentUser() user: any,
    @Args("bookId") bookId: number,
    @Args("chapterId") chapterId?: number,
  ) {
    return this.bookmarksService.createBookmark(
      Number(user?.userId ?? user?.id),
      Number(bookId),
      chapterId ? Number(chapterId) : undefined,
    );
  }

  @Mutation("deleteBookmark")
  deleteBookmark(@Args("id") id: number) {
    return this.bookmarksService.deleteBookmark(Number(id));
  }
}


