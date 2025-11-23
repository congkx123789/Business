import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Prisma } from "@prisma/social-service-client";
import { PrismaService } from "../../prisma/prisma.service";
import { SocialProducer } from "../../events/social.producer";
import { ActivityTrackingService } from "../activity-tracking/activity-tracking.service";
import { RpcException } from "@nestjs/microservices";

const CHALLENGE_CACHE_TTL_SECONDS = 3600;

interface CreateChallengeParams {
  creatorId: string;
  name: string;
  description?: string;
  challengeType: "personal" | "community";
  goal: number;
  goalType: "books" | "chapters" | "reading-time" | "pages";
  timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate: string;
  endDate: string;
  isPublic?: boolean;
}

@Injectable()
export class ReadingChallengesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialProducer: SocialProducer,
    private readonly activityTrackingService: ActivityTrackingService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private toNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new RpcException(`Invalid ID: ${value}`);
    }
    return parsed;
  }

  private toString(value: string | number): string {
    return String(value);
  }

  async createChallenge(params: CreateChallengeParams) {
    const creatorIdNum = this.toNumber(params.creatorId);
    const challenge = await this.prisma.readingChallenge.create({
      data: {
        creatorId: creatorIdNum,
        name: params.name,
        description: params.description,
        challengeType: params.challengeType,
        goal: params.goal,
        goalType: params.goalType,
        timeRange: params.timeRange,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        isPublic: params.isPublic ?? true,
      },
    });

    await this.prisma.challengeParticipant.create({
      data: {
        challengeId: challenge.id,
        userId: creatorIdNum,
      },
    });

    await Promise.all([
      this.socialProducer.emitReadingChallengeCreated(challenge),
      this.activityTrackingService.recordActivity({
        userId: this.toString(params.creatorId),
        activityType: "challenge-created",
        metadata: { challengeId: this.toString(challenge.id), goal: params.goal } as Prisma.JsonObject,
      }),
    ]);

    return this.mapChallenge(challenge);
  }

  async joinChallenge(challengeId: string, userId: string) {
    const challengeIdNum = this.toNumber(challengeId);
    const userIdNum = this.toNumber(userId);
    
    const challenge = await this.prisma.readingChallenge.findUnique({
      where: { id: challengeIdNum },
    });

    if (!challenge) {
      throw new RpcException("Challenge not found");
    }

    const existing = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId: challengeIdNum, userId: userIdNum },
      },
    });

    if (existing) {
      return this.mapParticipant(existing);
    }

    const participant = await this.prisma.challengeParticipant.create({
      data: {
        challengeId: challengeIdNum,
        userId: userIdNum,
      },
    });

    await this.activityTrackingService.recordActivity({
      userId,
      activityType: "challenge-joined",
      metadata: { challengeId } as Prisma.JsonObject,
    });

    await this.invalidateChallengeCache(challengeId);

    return this.mapParticipant(participant);
  }

  async updateProgress(challengeId: string, userId: string, progress: number) {
    const challengeIdNum = this.toNumber(challengeId);
    const userIdNum = this.toNumber(userId);
    
    const participant = await this.prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId: challengeIdNum,
          userId: userIdNum,
        },
      },
    });

    if (!participant) {
      throw new RpcException("User is not part of this challenge");
    }

    const updatedParticipant = await this.prisma.challengeParticipant.update({
      where: { id: participant.id },
      data: {
        progress,
        metadata: {
          lastUpdatedAt: new Date().toISOString(),
        } as Prisma.JsonObject,
      },
    });

    await Promise.all([
      this.recalculateChallengeProgress(challengeId),
      this.activityTrackingService.recordActivity({
        userId,
        activityType: "challenge-progress",
        metadata: { challengeId, progress } as Prisma.JsonObject,
      }),
      this.socialProducer.emitChallengeProgressUpdated(
        challengeId,
        userId,
        progress,
      ),
    ]);

    return this.mapParticipant(updatedParticipant);
  }

  async getChallengeDetail(challengeId: string) {
    const cacheKey = this.challengeCacheKey(challengeId);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const challengeIdNum = this.toNumber(challengeId);
    const challenge = await this.prisma.readingChallenge.findUnique({
      where: { id: challengeIdNum },
    });

    if (!challenge) {
      throw new RpcException("Challenge not found");
    }

    const participants = await this.prisma.challengeParticipant.findMany({
      where: { challengeId: challengeIdNum },
      orderBy: { progress: "desc" },
    });

    const payload = {
      challenge: this.mapChallenge(challenge),
      participants: participants.map((participant) => this.mapParticipant(participant)),
    };

    await this.cacheManager.set(cacheKey, payload, CHALLENGE_CACHE_TTL_SECONDS * 1000);
    return payload;
  }

  async getChallengeParticipants(challengeId: string) {
    const challengeIdNum = this.toNumber(challengeId);
    const participants = await this.prisma.challengeParticipant.findMany({
      where: { challengeId: challengeIdNum },
      orderBy: { progress: "desc" },
    });

    return {
      participants: participants.map((participant) => this.mapParticipant(participant)),
    };
  }

  async getFriendProgress(challengeId: string, userId: string) {
    const challengeIdNum = this.toNumber(challengeId);
    const userIdNum = this.toNumber(userId);
    
    const following = await this.prisma.follow.findMany({
      where: { followerId: userIdNum },
      select: { followingId: true },
    });

    const visibleUserIds = [userIdNum, ...following.map((entry) => entry.followingId)];

    const participants = await this.prisma.challengeParticipant.findMany({
      where: {
        challengeId: challengeIdNum,
        userId: { in: visibleUserIds },
      },
      orderBy: { progress: "desc" },
    });

    return {
      items: participants.map((participant) => this.mapParticipant(participant)),
    };
  }

  private async recalculateChallengeProgress(challengeId: string) {
    const challengeIdNum = this.toNumber(challengeId);
    const participants = await this.prisma.challengeParticipant.findMany({
      where: { challengeId: challengeIdNum },
    });

    if (!participants.length) {
      await this.prisma.readingChallenge.update({
        where: { id: challengeIdNum },
        data: { progress: 0 },
      });
      return;
    }

    const totalProgress = participants.reduce(
      (sum, participant) => sum + participant.progress,
      0,
    );

    const averageProgress = Math.round(totalProgress / participants.length);

    await this.prisma.readingChallenge.update({
      where: { id: challengeIdNum },
      data: { progress: averageProgress },
    });

    await this.invalidateChallengeCache(challengeId);
  }

  private challengeCacheKey(challengeId: string) {
    return `challenge:${challengeId}:progress`;
  }

  private async invalidateChallengeCache(challengeId: string) {
    await this.cacheManager.del(this.challengeCacheKey(challengeId));
  }

  private mapChallenge(challenge: {
    id: number;
    creatorId: number;
    name: string;
    description: string | null;
    challengeType: string;
    goal: number;
    goalType: string;
    timeRange: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    status: string;
    isPublic: boolean;
  }) {
    return {
      id: this.toString(challenge.id),
      creatorId: this.toString(challenge.creatorId),
      name: challenge.name,
      description: challenge.description ?? "",
      challengeType: challenge.challengeType,
      goal: challenge.goal,
      goalType: challenge.goalType,
      timeRange: challenge.timeRange,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      progress: challenge.progress,
      status: challenge.status,
      isPublic: challenge.isPublic,
    };
  }

  private mapParticipant(participant: {
    userId: number;
    challengeId: number;
    progress: number;
    joinedAt: Date;
    updatedAt: Date;
  }) {
    return {
      userId: this.toString(participant.userId),
      progress: participant.progress,
      joinedAt: participant.joinedAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
    };
  }
}


