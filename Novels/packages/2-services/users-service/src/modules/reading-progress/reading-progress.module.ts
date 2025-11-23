import { Module } from "@nestjs/common";
import { ReadingProgressService } from "./reading-progress.service";
import { ReadingProgressSyncService } from "./reading-progress-sync.service";

@Module({
  providers: [ReadingProgressService, ReadingProgressSyncService],
  exports: [ReadingProgressService, ReadingProgressSyncService],
})
export class ReadingProgressModule {}
