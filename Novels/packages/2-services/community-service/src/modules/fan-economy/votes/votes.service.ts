import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../common/database/database.service";
import { CastVoteDto } from "./dto/cast-vote.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

@Injectable()
export class VotesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async castVote(payload: CastVoteDto) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const vote = await this.databaseService.monthlyVote.upsert({
      where: {
        userId_storyId_month_year: {
          userId: payload.userId,
          storyId: payload.storyId,
          month,
          year,
        },
      },
      update: {
        votes: { increment: payload.votes },
        bonusVotes: { increment: payload.bonusVotes ?? 0 },
      },
      create: {
        userId: payload.userId,
        storyId: payload.storyId,
        votes: payload.votes,
        bonusVotes: payload.bonusVotes ?? 0,
        month,
        year,
      },
    });

    await this.events.monthlyVoteCast({
      storyId: payload.storyId,
      userId: payload.userId,
      votes: payload.votes,
      bonusVotes: payload.bonusVotes ?? 0,
      month,
      year,
    });

    return vote;
  }

  async getMonthlyVoteResults(options: { storyId: string; year?: number; month?: number }) {
    const now = new Date();
    const month = options.month ?? now.getMonth() + 1;
    const year = options.year ?? now.getFullYear();

    const aggregate = await this.databaseService.monthlyVote.aggregate({
      where: { storyId: options.storyId, month, year },
      _sum: { votes: true, bonusVotes: true },
    });

    return {
      storyId: options.storyId,
      month,
      year,
      totalVotes: (aggregate._sum.votes ?? 0) + (aggregate._sum.bonusVotes ?? 0),
    };
  }

  async getUserVotes(options: { userId: string; year?: number; month?: number }) {
    const now = new Date();
    const month = options.month ?? now.getMonth() + 1;
    const year = options.year ?? now.getFullYear();

    return this.databaseService.monthlyVote.findFirst({
      where: { userId: options.userId, month, year },
    });
  }

  async resetMonthlyVotes() {
    const now = new Date();
    const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    await this.databaseService.monthlyVote.deleteMany({
      where: {
        month: previousMonth,
        year: previousYear,
      },
    });
    return { resetAt: new Date().toISOString() };
  }
}

