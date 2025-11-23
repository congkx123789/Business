import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class ReadingProgressSyncService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async syncProgress(userId: string, deviceId: string, updates: Array<{ storyId: string; chapterId: string; position: number }> = []) {
    const normalizedUserId = this.normalizeUserId(userId);

    if (updates.length) {
      const ops = updates.map((update) =>
        this.prisma.readingProgress.upsert({
          where: {
            userId_storyId: {
              userId: normalizedUserId,
              storyId: update.storyId,
            },
          },
          update: {
            chapterId: update.chapterId,
            position: update.position,
            deviceId,
            syncVersion: { increment: 1 },
            lastSyncedAt: new Date(),
          },
          create: {
            userId: normalizedUserId,
            storyId: update.storyId,
            chapterId: update.chapterId,
            position: update.position,
            deviceId,
            syncVersion: 1,
          },
        })
      );

      await this.prisma.$transaction(ops);
    }

    const progress = await this.prisma.readingProgress.findMany({
      where: { userId: normalizedUserId },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      data: progress.map((item) => ({
        storyId: item.storyId,
        chapterId: item.chapterId,
        position: item.position,
        progressPercentage: item.progressPercentage,
        updatedAt: item.updatedAt.toISOString(),
      })),
      message: "Reading progress synced",
    };
  }
}

