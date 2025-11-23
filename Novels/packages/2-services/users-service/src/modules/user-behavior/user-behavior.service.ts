import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/users-service-client";
import { DatabaseService } from "../../common/database/database.service";

interface TrackBehaviorPayload {
  userId: string;
  action: string;
  storyId?: string;
  chapterId?: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class UserBehaviorService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }

    return parsed;
  }

  async trackBehavior(payload: TrackBehaviorPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const event = await this.prisma.userBehaviorEvent.create({
        data: {
          userId: normalizedUserId,
          action: payload.action,
          storyId: payload.storyId,
          chapterId: payload.chapterId,
          metadata: payload.metadata,
        },
      });

      return {
        success: true,
        data: {
          id: event.id,
          action: event.action,
          storyId: event.storyId ?? undefined,
          chapterId: event.chapterId ?? undefined,
          metadata: event.metadata ?? undefined,
          timestamp: event.timestamp.toISOString(),
        },
        message: "Behavior event recorded",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to track behavior",
      };
    }
  }

  async getUserBehavior(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const events = await this.prisma.userBehaviorEvent.findMany({
        where: { userId: normalizedUserId },
        orderBy: { timestamp: "desc" },
        take: 100,
      });

      return {
        success: true,
        data: events.map((event) => ({
          id: event.id,
          action: event.action,
          storyId: event.storyId ?? undefined,
          chapterId: event.chapterId ?? undefined,
          metadata: event.metadata ?? undefined,
          timestamp: event.timestamp.toISOString(),
        })),
        message: "Behavior events retrieved",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load behavior events",
      };
    }
  }
}
