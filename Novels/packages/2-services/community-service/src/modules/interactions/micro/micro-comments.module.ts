import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { MicroCommentsService } from "./micro-comments.service";

@Module({
  imports: [DatabaseModule],
  providers: [MicroCommentsService],
  exports: [MicroCommentsService],
})
export class MicroCommentsModule {}

