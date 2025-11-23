import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { PlatformInteractionsService } from "./platform-interactions.service";

@Module({
  imports: [DatabaseModule],
  providers: [PlatformInteractionsService],
  exports: [PlatformInteractionsService],
})
export class PlatformInteractionsModule {}

