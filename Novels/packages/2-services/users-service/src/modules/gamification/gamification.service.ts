import { Injectable } from "@nestjs/common";
import { DailyMissionsService } from "./daily-missions.service";
import { PowerStonesService } from "./power-stones.service";
import { RewardsService } from "./rewards.service";

@Injectable()
export class GamificationService {
  constructor(
    private readonly dailyMissionsService: DailyMissionsService,
    private readonly powerStonesService: PowerStonesService,
    private readonly rewardsService: RewardsService
  ) {}

  async getDailyMissions(userId: string) {
    try {
      const missions = await this.dailyMissionsService.getDailyMissions(userId);
      return {
        success: true,
        data: missions,
        message: "Daily missions retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load daily missions",
      };
    }
  }

  async claimMission(data: { userId: string; missionId: string }) {
    try {
      const reward = await this.dailyMissionsService.claimMission(data.userId, data.missionId);
      return {
        success: true,
        data: {
          missionId: data.missionId,
          reward: {
            type: reward.rewardType,
            amount: reward.amount,
          },
          claimedAt: new Date().toISOString(),
        },
        message: "Mission reward claimed",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to claim mission",
      };
    }
  }

  async getPowerStones(userId: string) {
    try {
      const data = await this.powerStonesService.getPowerStones(userId);
      return {
        success: true,
        data,
        message: "Power Stones retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to load Power Stones",
      };
    }
  }

  async getFastPasses(userId: string) {
    try {
      const passes = await this.rewardsService.getFastPasses(userId);
      return {
        success: true,
        data: passes,
        message: "Fast Passes retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load Fast Passes",
      };
    }
  }
}
