import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { ReadingProgressService } from "./reading-progress.service";

@Module({
  imports: [DatabaseModule],
  providers: [ReadingProgressService],
  exports: [ReadingProgressService],
})
export class ReadingProgressModule {}


