import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { AuthorFanService } from "./author-fan.service";

@Module({
  imports: [DatabaseModule],
  providers: [AuthorFanService],
  exports: [AuthorFanService],
})
export class AuthorFanModule {}

