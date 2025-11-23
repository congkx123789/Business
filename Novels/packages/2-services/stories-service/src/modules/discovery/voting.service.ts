import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class VotingService {
  private readonly logger = new Logger(VotingService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async castPowerStone(userId: number, storyId: number) {
    try {
      const result = (await this.databaseService.createData<any[]>(11, "spVoting_CastPowerStone", [
        ["UserId", userId],
        ["StoryId", storyId],
      ])) as any[];

      return {
        success: true,
        data: result?.[0] ?? null,
        message: "Power Stone cast successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to cast Power Stone for user ${userId} on story ${storyId}`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cast Power Stone",
      };
    }
  }

  async castMonthlyVote(userId: number, storyId: number, votes: number) {
    try {
      const result = (await this.databaseService.createData<any[]>(11, "spVoting_CastMonthlyVote", [
        ["UserId", userId],
        ["StoryId", storyId],
        ["Votes", votes],
      ])) as any[];

      return {
        success: true,
        data: result?.[0] ?? null,
        message: "Monthly vote cast successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cast monthly vote",
      };
    }
  }

  async getUserVotes(userId: number) {
    try {
      const result = (await this.databaseService.createData<any[]>(11, "spVoting_GetUserVotes", [
        ["UserId", userId],
      ])) as any[];

      return {
        success: true,
        data: result?.[0] ?? { powerStones: 0, monthlyVotes: 0 },
        message: "User votes retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: { powerStones: 0, monthlyVotes: 0 },
        message: error instanceof Error ? error.message : "Failed to get user votes",
      };
    }
  }
}


