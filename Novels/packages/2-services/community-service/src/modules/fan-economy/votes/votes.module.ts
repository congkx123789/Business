import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { VotesService } from "./votes.service";

@Module({
  imports: [DatabaseModule],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}

