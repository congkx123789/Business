import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/social-service-client";
import { PrismaService } from "../../prisma/prisma.service";
import { SocialProducer } from "../../events/social.producer";

interface RecordActivityParams {
  userId: string;
  activityType: string;
  storyId?: string;
  chapterId?: string;
  metadata?: Prisma.JsonValue;
  timestamp?: Date;
}

interface SetReadingGoalParams {
  goalType: "books" | "chapters" | "reading-time" | "pages";
  target: number;
  timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate: string;
  endDate: string;
}

@Injectable()
export class ActivityTrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialProducer: SocialProducer,
  ) {}

  async recordActivity(params: RecordActivityParams) {
    return this.prisma.activityTracking.create({
      data: {
        userId: Number(params.userId),
        activityType: params.activityType,
        storyId: params.storyId ? Number(params.storyId) : undefined,
        chapterId: params.chapterId ? Number(params.chapterId) : undefined,
        metadata: params.metadata ?? undefined,
        timestamp: params.timestamp ?? new Date(),
      },
    });
  }

  async setReadingGoal(userId: string, payload: SetReadingGoalParams) {
    const numericUserId = Number(userId);
    const goal = await this.prisma.readingGoal.upsert({
      where: {
        userId_goalType_timeRange: {
          userId: numericUserId,
          goalType: payload.goalType,
          timeRange: payload.timeRange,
        },
      },
      create: {
        userId: numericUserId,
        goalType: payload.goalType,
        target: payload.target,
        timeRange: payload.timeRange,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
      },
      update: {
        target: payload.target,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        status: "active",
      },
    });

    await this.recordActivity({
      userId,
      activityType: "goal-set",
      metadata: {
        goalType: payload.goalType,
        target: payload.target,
      } as Prisma.JsonObject,
    });
    await this.socialProducer.emitReadingGoalSet(userId, String(goal.id));

    return this.mapGoal(goal);
  }

  async getActivityFeed(userId: string, page: number, limit: number) {
    const numericUserId = Number(userId);
    const [items, total] = await Promise.all([
      this.prisma.activityTracking.findMany({
        where: { userId: numericUserId },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.activityTracking.count({ where: { userId: numericUserId } }),
    ]);

    return {
      events: items.map((item) => ({
        id: item.id,
        activityType: item.activityType,
        storyId: item.storyId ?? undefined,
        chapterId: item.chapterId ?? undefined,
        metadata: item.metadata ?? undefined,
        timestamp: item.timestamp.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getReadingStatistics(userId: string) {
    const numericUserId = Number(userId);
    const [counts, goals] = await Promise.all([
      this.prisma.activityTracking.groupBy({
        by: ["activityType"],
        where: { userId: numericUserId },
        _count: { _all: true },
      }),
      this.prisma.readingGoal.findMany({
        where: { userId: numericUserId, status: "active" },
      }),
    ]);

    return {
      metrics: counts.map((entry) => ({
        activityType: entry.activityType,
        count: entry._count._all,
      })),
      activeGoals: goals.map((goal) => this.mapGoal(goal)),
    };
  }

  async getReadingGoals(userId: string) {
    const numericUserId = Number(userId);
    const goals = await this.prisma.readingGoal.findMany({
      where: { userId: numericUserId },
      orderBy: { createdAt: "desc" },
    });

    return {
      goals: goals.map((goal) => this.mapGoal(goal)),
    };
  }

  private mapGoal(goal: {
    id: number;
    goalType: string;
    target: number;
    current: number;
    timeRange: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }) {
    return {
      id: String(goal.id),
      goalType: goal.goalType,
      target: goal.target,
      current: goal.current,
      timeRange: goal.timeRange,
      startDate: goal.startDate.toISOString(),
      endDate: goal.endDate.toISOString(),
      status: goal.status,
    };
  }
}


