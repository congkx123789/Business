import { Module } from "@nestjs/common";
import { TagsService } from "./tags.service";
import { FilteredViewsService } from "./filtered-views.service";

@Module({
  providers: [TagsService, FilteredViewsService],
  exports: [TagsService, FilteredViewsService],
})
export class LibraryAdvancedOrganizationModule {}

