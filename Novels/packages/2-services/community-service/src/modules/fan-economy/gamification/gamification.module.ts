import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { GamificationService } from "./gamification.service";

@Module({
  imports: [DatabaseModule],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}

