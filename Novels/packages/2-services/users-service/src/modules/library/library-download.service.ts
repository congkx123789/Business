import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { DownloadStatus } from "@prisma/users-service-client";

interface DownloadQueueFilters {
  status?: DownloadStatus;
  storyId?: string;
}

@Injectable()
export class LibraryDownloadService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async queueDownload(userId: string, storyId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const item = await this.prisma.libraryItem.upsert({
      where: {
        userId_storyId: {
          userId: normalizedUserId,
          storyId,
        },
      },
      update: {
        downloadStatus: DownloadStatus.PENDING,
        downloadProgress: 0,
      },
      create: {
        userId: normalizedUserId,
        storyId,
        downloadStatus: DownloadStatus.PENDING,
      },
    });

    return {
      success: true,
      data: item,
      message: "Download queued",
    };
  }

  async downloadStory(userId: string, storyId: string, includePremium = false) {
    const result = await this.queueDownload(userId, storyId);
    return {
      ...result,
      data: {
        ...result.data,
        includePremium,
      },
    };
  }

  async batchDownload(userId: string, storyIds: string[], includePremium = false) {
    const jobs = await Promise.all(storyIds.map((storyId) => this.queueDownload(userId, storyId)));
    return {
      success: true,
      data: jobs.map((job) => ({
        storyId: job.data.storyId,
        status: job.data.downloadStatus,
        includePremium,
      })),
      message: "Batch download queued",
    };
  }

  async updateDownloadProgress(userId: string, storyId: string, progress: number, status: DownloadStatus) {
    const normalizedUserId = this.normalizeUserId(userId);
    await this.prisma.libraryItem.update({
      where: {
        userId_storyId: {
          userId: normalizedUserId,
          storyId,
        },
      },
      data: {
        downloadProgress: progress,
        downloadStatus: status,
        downloadedAt: status === DownloadStatus.COMPLETED ? new Date() : undefined,
      },
    });

    return {
      success: true,
      message: "Download progress updated",
    };
  }

  async getDownloadQueue(userId: string, filters: DownloadQueueFilters = {}) {
    const normalizedUserId = this.normalizeUserId(userId);
    const items = await this.prisma.libraryItem.findMany({
      where: {
        userId: normalizedUserId,
        ...(filters.status
          ? { downloadStatus: filters.status }
          : { downloadStatus: { in: [DownloadStatus.PENDING, DownloadStatus.DOWNLOADING] } }),
        ...(filters.storyId ? { storyId: filters.storyId } : {}),
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      data: items.map((item) => ({
        storyId: item.storyId,
        status: item.downloadStatus,
        progress: item.downloadProgress,
        updatedAt: item.updatedAt.toISOString(),
        error: item.downloadStatus === DownloadStatus.FAILED ? "Download failed" : undefined,
      })),
      message: "Download queue retrieved",
    };
  }
}

