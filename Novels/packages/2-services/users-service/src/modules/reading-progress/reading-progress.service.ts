import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

interface UpdateProgressPayload {
  userId: string;
  storyId: string;
  chapterId: string;
  position?: number;
  progress?: number;
  deviceId?: string;
  completed?: boolean;
}

@Injectable()
export class ReadingProgressService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private mapProgress(progress: {
    id: string;
    storyId: string;
    chapterId: string;
    position: number;
    progressPercentage: number;
    lastReadAt: Date;
    isCompleted: boolean;
    updatedAt: Date;
  }) {
    return {
      id: progress.id,
      storyId: progress.storyId,
      chapterId: progress.chapterId,
      position: progress.position,
      progressPercentage: progress.progressPercentage,
      lastReadAt: progress.lastReadAt.toISOString(),
      isCompleted: progress.isCompleted,
      updatedAt: progress.updatedAt.toISOString(),
    };
  }

  async getReadingProgress(userId: string, storyId?: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      if (storyId) {
        const progress = await this.prisma.readingProgress.findUnique({
          where: {
            userId_storyId: {
              userId: normalizedUserId,
              storyId,
            },
          },
        });

        return {
          success: true,
          data: progress ? [this.mapProgress(progress)] : [],
          message: "Reading progress retrieved",
        };
      }

      const progressList = await this.prisma.readingProgress.findMany({
        where: { userId: normalizedUserId },
        orderBy: { updatedAt: "desc" },
      });

      return {
        success: true,
        data: progressList.map((item) => this.mapProgress(item)),
        message: "Reading progress list retrieved",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load reading progress",
      };
    }
  }

  async updateReadingProgress(payload: UpdateProgressPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const progress = await this.prisma.readingProgress.upsert({
        where: {
          userId_storyId: {
            userId: normalizedUserId,
            storyId: payload.storyId,
          },
        },
        update: {
          chapterId: payload.chapterId,
          position: payload.position ?? undefined,
          progressPercentage: payload.progress ?? undefined,
          isCompleted: payload.completed ?? undefined,
          lastReadAt: new Date(),
          deviceId: payload.deviceId ?? undefined,
          syncVersion: { increment: 1 },
        },
        create: {
          userId: normalizedUserId,
          storyId: payload.storyId,
          chapterId: payload.chapterId,
          position: payload.position ?? 0,
          progressPercentage: payload.progress ?? 0,
          deviceId: payload.deviceId,
          isCompleted: payload.completed ?? false,
        },
      });

      return {
        success: true,
        data: this.mapProgress(progress),
        message: "Reading progress updated",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update reading progress",
      };
    }
  }

  async markAsCompleted(userId: string, storyId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const progress = await this.prisma.readingProgress.upsert({
        where: {
          userId_storyId: {
            userId: normalizedUserId,
            storyId,
          },
        },
        update: {
          isCompleted: true,
          progressPercentage: 100,
          lastReadAt: new Date(),
          syncVersion: { increment: 1 },
        },
        create: {
          userId: normalizedUserId,
          storyId,
          chapterId: "",
          position: 0,
          progressPercentage: 100,
          isCompleted: true,
        },
      });

      return {
        success: true,
        data: this.mapProgress(progress),
        message: "Story marked as completed",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to mark story as completed",
      };
    }
  }
}
