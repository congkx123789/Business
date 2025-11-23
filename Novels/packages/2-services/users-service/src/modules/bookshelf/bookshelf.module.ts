import { Module } from "@nestjs/common";
import { BookshelfService } from "./bookshelf.service";
import { BookshelfOrganizationService } from "./bookshelf-organization.service";

@Module({
  providers: [BookshelfService, BookshelfOrganizationService],
  exports: [BookshelfService, BookshelfOrganizationService],
})
export class BookshelfModule {}
