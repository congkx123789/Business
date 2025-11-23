import { Module } from "@nestjs/common";
import { GamificationService } from "./gamification.service";
import { DailyMissionsService } from "./daily-missions.service";
import { PowerStonesService } from "./power-stones.service";
import { RewardsService } from "./rewards.service";

@Module({
  providers: [GamificationService, DailyMissionsService, PowerStonesService, RewardsService],
  exports: [GamificationService, DailyMissionsService, PowerStonesService, RewardsService],
})
export class GamificationModule {}
