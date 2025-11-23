import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LibraryService } from "./library.service";

@Controller("bookshelves")
@UseGuards(JwtAuthGuard)
export class BookshelvesController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  getBookshelves(@CurrentUser() user: any) {
    return this.libraryService.getBookshelves(Number(user.userId ?? user.id));
  }

  @Post()
  createBookshelf(
    @CurrentUser() user: any,
    @Body() payload: { name: string; description?: string },
  ) {
    return this.libraryService.createBookshelf(
      Number(user.userId ?? user.id),
      payload,
    );
  }

  @Put(":id")
  updateBookshelf(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() payload: { name?: string; description?: string },
  ) {
    return this.libraryService.updateBookshelf(
      Number(user.userId ?? user.id),
      Number(id),
      payload,
    );
  }

  @Delete(":id")
  deleteBookshelf(@CurrentUser() user: any, @Param("id") id: string) {
    return this.libraryService.deleteBookshelf(
      Number(user.userId ?? user.id),
      Number(id),
    );
  }

  @Post(":id/items")
  addToBookshelf(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() payload: { libraryId: number },
  ) {
    return this.libraryService.addToBookshelf(
      Number(user.userId ?? user.id),
      Number(id),
      Number(payload.libraryId),
    );
  }

  @Delete(":id/items/:libraryId")
  removeFromBookshelf(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Param("libraryId") libraryId: string,
  ) {
    return this.libraryService.removeFromBookshelf(
      Number(user.userId ?? user.id),
      Number(id),
      Number(libraryId),
    );
  }

  @Put(":id/reorder")
  reorderBookshelf(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body()
    payload: { items: Array<{ libraryId: number; position: number }> },
  ) {
    return this.libraryService.reorderBookshelf(
      Number(user.userId ?? user.id),
      Number(id),
      payload.items ?? [],
    );
  }
}


