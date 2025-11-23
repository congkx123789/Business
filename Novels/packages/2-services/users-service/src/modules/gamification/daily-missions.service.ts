import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { MissionType, RewardType } from "@prisma/users-service-client";

type MissionTypeEnum = MissionType;

type MissionRewardConfig = {
    rewardType: RewardType;
    rewardAmount: number;
    description: string;
};

const ALL_MISSION_TYPES: MissionTypeEnum[] = ["CHECK_IN", "READING", "AD", "VOTING"];

const DAILY_MISSION_CONFIG: Record<MissionTypeEnum, MissionRewardConfig> = {
  CHECK_IN: {
    rewardType: "POINTS",
    rewardAmount: 10,
    description: "Check in today",
  },
  READING: {
    rewardType: "FAST_PASS",
    rewardAmount: 1,
    description: "Read for 20 minutes",
  },
  AD: {
    rewardType: "FAST_PASS",
    rewardAmount: 1,
    description: "Watch rewarded ad",
  },
  VOTING: {
    rewardType: "POINTS",
    rewardAmount: 5,
    description: "Vote with Power Stones",
  },
};

@Injectable()
export class DailyMissionsService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private getDayRange(reference = new Date()) {
    const start = new Date(reference);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  private async ensureDailyMissions(userId: number) {
    const { start, end } = this.getDayRange();
    const existing = await this.prisma.dailyMission.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        rewards: true,
      },
    });

    if (existing.length === Object.keys(DAILY_MISSION_CONFIG).length) {
      return existing;
    }

    const existingTypes = new Set(existing.map((mission) => mission.missionType));
    const missionsToCreate = ALL_MISSION_TYPES
      .filter((type) => !existingTypes.has(type))
      .map((missionType) =>
        this.prisma.dailyMission.create({
          data: {
            userId,
            missionType,
            date: start,
            completed: false,
            claimed: false,
          },
          include: { rewards: true },
        })
      );

    const created = missionsToCreate.length ? await this.prisma.$transaction(missionsToCreate) : [];
    return [...existing, ...created];
  }

  async getDailyMissions(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const missions = await this.ensureDailyMissions(normalizedUserId);

    return missions.map((mission) => {
      const config = DAILY_MISSION_CONFIG[mission.missionType];
      return {
        id: mission.id,
        type: mission.missionType,
        completed: mission.completed,
        claimed: mission.claimed,
        reward: {
          type: config.rewardType,
          amount: config.rewardAmount,
        },
        description: config.description,
      };
    });
  }

  async claimMission(userId: string, missionId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const mission = await this.prisma.dailyMission.findFirst({
      where: { id: missionId, userId: normalizedUserId },
    });

    if (!mission) {
      throw new Error("Mission not found");
    }

    if (mission.claimed) {
      throw new Error("Mission already claimed");
    }

    const rewardConfig = DAILY_MISSION_CONFIG[mission.missionType];
    const [, reward] = await this.prisma.$transaction([
      this.prisma.dailyMission.update({
        where: { id: mission.id },
        data: {
          completed: true,
          claimed: true,
        },
      }),
      this.prisma.missionReward.create({
        data: {
          userId: normalizedUserId,
          missionId: mission.id,
          rewardType: rewardConfig.rewardType,
          amount: rewardConfig.rewardAmount,
          source: "mission",
        },
      }),
    ]);

    return reward;
  }
}

