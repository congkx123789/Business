import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

interface UpdateDownloadSettingsPayload {
  userId: string;
  autoDownloadNewChapters?: boolean;
  maxStorageMB?: number;
}

@Injectable()
export class LibraryStorageService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private bytesToString(value?: bigint | null) {
    return value ? value.toString() : "0";
  }

  async getStorageUsage(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const [aggregate, grouped, preferences] = await this.prisma.$transaction([
      this.prisma.libraryItem.aggregate({
        where: {
          userId: normalizedUserId,
          isDownloaded: true,
        },
        _sum: {
          downloadSize: true,
        },
        _count: true,
      }),
      this.prisma.libraryItem.groupBy({
        by: ["downloadStatus"],
        where: {
          userId: normalizedUserId,
        },
        _sum: {
          downloadSize: true,
        },
      }),
      this.prisma.desktopPreferences.findUnique({
        where: { userId: normalizedUserId },
      }),
    ]);

    const maxStorageMB = typeof (preferences?.savedFilters as any)?.maxStorageMB === "number" ? (preferences?.savedFilters as any).maxStorageMB : 2048;
    const capacityBytes = Math.max(maxStorageMB, 1) * 1024 * 1024;
    const usedBytes = Number(aggregate._sum.downloadSize ?? BigInt(0));
    const percentage = Math.min(Math.round((usedBytes / capacityBytes) * 1000) / 10, 100);

    const breakdown = grouped.map((entry) => ({
      category: entry.downloadStatus,
      bytes: this.bytesToString(entry._sum.downloadSize),
    }));

    return {
      success: true,
      data: {
        totalBytes: capacityBytes.toString(),
        usedBytes: usedBytes.toString(),
        percentage,
        itemCount: aggregate._count,
        breakdown,
      },
      message: "Storage usage retrieved",
    };
  }

  async updateDownloadSettings(payload: UpdateDownloadSettingsPayload) {
    const normalizedUserId = this.normalizeUserId(payload.userId);
    await this.prisma.desktopPreferences.upsert({
      where: { userId: normalizedUserId },
      update: {
        savedFilters: {
          ...(payload.autoDownloadNewChapters !== undefined
            ? { autoDownloadNewChapters: payload.autoDownloadNewChapters }
            : {}),
          ...(payload.maxStorageMB !== undefined ? { maxStorageMB: payload.maxStorageMB } : {}),
        },
      },
      create: {
        userId: normalizedUserId,
        savedFilters: {
          autoDownloadNewChapters: payload.autoDownloadNewChapters ?? false,
          maxStorageMB: payload.maxStorageMB ?? 1024,
        },
      },
    });

    return {
      success: true,
      message: "Download settings updated",
    };
  }
}

