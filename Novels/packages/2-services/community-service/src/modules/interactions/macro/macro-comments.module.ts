import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { MacroCommentsService } from "./macro-comments.service";

@Module({
  imports: [DatabaseModule],
  providers: [MacroCommentsService],
  exports: [MacroCommentsService],
})
export class MacroCommentsModule {}

