import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { QueueModule } from "../../common/queue/queue.module";
import { StorageModule } from "../storage/storage.module";
import { ChaptersService } from "./chapters.service";
import { ChapterDownloadService } from "./chapter-download.service";

@Module({
  imports: [DatabaseModule, QueueModule, StorageModule],
  providers: [ChaptersService, ChapterDownloadService],
  exports: [ChaptersService, ChapterDownloadService],
})
export class ChaptersModule {}


