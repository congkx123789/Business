import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LibraryService } from "./library.service";

@Controller("wishlist")
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  getWishlist(@CurrentUser() user: any) {
    return this.libraryService.getWishlist(Number(user.userId ?? user.id));
  }

  @Post()
  addToWishlist(
    @CurrentUser() user: any,
    @Body() payload: { storyId: number; priority?: number; notes?: string },
  ) {
    return this.libraryService.addToWishlist(
      Number(user.userId ?? user.id),
      {
        storyId: Number(payload.storyId),
        priority: payload.priority ? Number(payload.priority) : undefined,
        notes: payload.notes,
      },
    );
  }

  @Delete(":storyId")
  removeFromWishlist(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.removeFromWishlist(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }

  @Post(":storyId/move-to-library")
  moveToLibrary(
    @CurrentUser() user: any,
    @Param("storyId") storyId: string,
  ) {
    return this.libraryService.moveWishlistToLibrary(
      Number(user.userId ?? user.id),
      Number(storyId),
    );
  }
}


