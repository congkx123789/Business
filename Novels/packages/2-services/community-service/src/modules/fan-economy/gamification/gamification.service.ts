import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../common/database/database.service";
import { GamificationRewardType } from "@prisma/community-service-client";
import { CalculateBonusVotesDto } from "./dto/calculate-bonus-votes.dto";

@Injectable()
export class GamificationService {
  constructor(private readonly databaseService: DatabaseService) {}

  calculateBonusVotes(payload: CalculateBonusVotesDto) {
    const bonusVotes = Math.floor(payload.tipAmount / 100);
    return { bonusVotes };
  }

  async awardReward(payload: {
    userId: string;
    storyId?: string;
    rewardType: "bonus_votes" | "badge" | "status";
    amount?: number;
  }) {
    const rewardTypeMap: Record<string, GamificationRewardType> = {
      bonus_votes: GamificationRewardType.BONUS_VOTES,
      badge: GamificationRewardType.BADGE,
      status: GamificationRewardType.STATUS,
    };

    return this.databaseService.gamificationReward.create({
      data: {
        userId: payload.userId,
        storyId: payload.storyId,
        rewardType: rewardTypeMap[payload.rewardType],
        amount: payload.amount,
        triggeredBy: "manual",
      },
    });
  }

  async getUserRewards(userId: string) {
    return this.databaseService.gamificationReward.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

