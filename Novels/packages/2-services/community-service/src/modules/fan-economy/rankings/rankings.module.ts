import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { RankingsService } from "./rankings.service";

@Module({
  imports: [DatabaseModule],
  providers: [RankingsService],
  exports: [RankingsService],
})
export class RankingsModule {}

