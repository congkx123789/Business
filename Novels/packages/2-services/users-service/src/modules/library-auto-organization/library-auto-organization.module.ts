import { Module } from "@nestjs/common";
import { LibraryAutoOrganizationService } from "./library-auto-organization.service";
import { SystemListsService } from "./system-lists.service";

@Module({
  providers: [LibraryAutoOrganizationService, SystemListsService],
  exports: [LibraryAutoOrganizationService, SystemListsService],
})
export class LibraryAutoOrganizationModule {}

