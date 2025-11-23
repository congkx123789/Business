import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { StoriesModule } from "../stories/stories.module";
import { GenresService } from "./genres.service";
import { GenreBrowsingService } from "./genre-browsing.service";

@Module({
  imports: [DatabaseModule, StoriesModule],
  providers: [GenresService, GenreBrowsingService],
  exports: [GenresService, GenreBrowsingService],
})
export class GenresModule {}


