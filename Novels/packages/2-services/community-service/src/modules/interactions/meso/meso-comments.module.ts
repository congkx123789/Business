import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { MesoCommentsService } from "./meso-comments.service";

@Module({
  imports: [DatabaseModule],
  providers: [MesoCommentsService],
  exports: [MesoCommentsService],
})
export class MesoCommentsModule {}

