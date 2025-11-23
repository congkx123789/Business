import { Injectable } from "@nestjs/common";
import { FanRankingType, FanRankingWindow, Prisma } from "@prisma/community-service-client";
import { DatabaseService } from "../../../common/database/database.service";
import { GetRankingsDto } from "./dto/get-rankings.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

@Injectable()
export class RankingsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async calculateFanRankings(options: GetRankingsDto) {
    // Simple implementation: sum tips per user per scope
    const whereTip: Prisma.TipWhereInput = {
      ...(options.storyId ? { storyId: options.storyId } : {}),
      ...(options.authorId ? { authorId: options.authorId } : {}),
    };

    const rankingType = this.mapRankingType(options.type);
    const timeRange = this.mapTimeRange(options.timeRange);

    const totals = await this.databaseService.tip.groupBy({
      by: ["userId"],
      where: whereTip,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: options.limit ?? 100,
    });

    await this.databaseService.$transaction(
      totals.map((row, index) =>
        this.databaseService.fanRanking.upsert({
          where: {
            userId_storyId_authorId_rankingType_timeRange: {
              userId: row.userId,
              storyId: options.storyId ?? null,
              authorId: options.authorId ?? null,
              rankingType,
              timeRange,
            },
          },
          update: {
            score: row._sum.amount ?? new Prisma.Decimal(0),
            rank: index + 1,
          },
          create: {
            userId: row.userId,
            storyId: options.storyId ?? null,
            authorId: options.authorId ?? null,
            rankingType,
            timeRange,
            score: row._sum.amount ?? new Prisma.Decimal(0),
            rank: index + 1,
          },
        })
      )
    );

    const processedAt = new Date().toISOString();
    await this.events.fanRankingUpdated({
      storyId: options.storyId,
      authorId: options.authorId,
      type: rankingType,
      timeRange,
      processedAt,
    });

    return { processedAt };
  }

  async getFanRankings(options: GetRankingsDto) {
    const rankings = await this.databaseService.fanRanking.findMany({
      where: {
        rankingType: this.mapRankingType(options.type),
        timeRange: this.mapTimeRange(options.timeRange),
        storyId: options.storyId ?? null,
        authorId: options.authorId ?? null,
      },
      orderBy: { rank: "asc" },
      take: options.limit ?? 100,
    });

    return rankings;
  }

  async getUserRanking(options: { userId: string; storyId?: string; authorId?: string }) {
    return this.databaseService.fanRanking.findFirst({
      where: {
        userId: options.userId,
        storyId: options.storyId ?? null,
        authorId: options.authorId ?? null,
      },
    });
  }

  private mapRankingType(type: GetRankingsDto["type"]): FanRankingType {
    switch (type) {
      case "story":
        return FanRankingType.STORY;
      case "author":
        return FanRankingType.AUTHOR;
      case "monthly":
        return FanRankingType.MONTHLY;
      default:
        return FanRankingType.ALL_TIME;
    }
  }

  private mapTimeRange(range: GetRankingsDto["timeRange"]): FanRankingWindow {
    switch (range) {
      case "monthly":
        return FanRankingWindow.MONTHLY;
      case "weekly":
        return FanRankingWindow.WEEKLY;
      default:
        return FanRankingWindow.ALL_TIME;
    }
  }
}

