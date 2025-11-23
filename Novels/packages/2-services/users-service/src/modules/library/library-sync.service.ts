import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

export interface SyncLibraryPayload {
  userId: string;
  deviceId?: string;
  items?: Array<{
    id?: string;
    storyId: string;
    lastReadAt?: string;
    lastChapterId?: string;
    notes?: string;
    updatedAt?: string;
  }>;
}

interface SyncQueueOperation {
  operationType: string;
  entity: string;
  payloadJson: string;
}

@Injectable()
export class LibrarySyncService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async syncLibrary(payload: SyncLibraryPayload) {
    const normalizedUserId = this.normalizeUserId(payload.userId);

    // Optional: If client sends items, process them (for backward compatibility)
    // But proto doesn't include items field, so this is mainly for internal use
    if (payload.items?.length) {
      const updates = payload.items.map((item) =>
        this.prisma.libraryItem.upsert({
          where: {
            userId_storyId: {
              userId: normalizedUserId,
              storyId: item.storyId,
            },
          },
          update: {
            lastReadAt: item.lastReadAt ? new Date(item.lastReadAt) : undefined,
            lastChapterId: item.lastChapterId,
            notes: item.notes,
            deviceId: payload.deviceId,
            lastSyncedAt: new Date(),
          },
          create: {
            userId: normalizedUserId,
            storyId: item.storyId,
            lastReadAt: item.lastReadAt ? new Date(item.lastReadAt) : undefined,
            lastChapterId: item.lastChapterId,
            notes: item.notes,
            deviceId: payload.deviceId,
            lastSyncedAt: new Date(),
          },
        })
      );

      await this.prisma.$transaction(updates);
    }

    // Server is source of truth - return all library items
    // Client should use GetPendingSyncQueue + ProcessSyncQueue to push changes
    const latest = await this.prisma.libraryItem.findMany({
      where: { userId: normalizedUserId },
      orderBy: { updatedAt: "desc" },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        bookshelfItems: true,
        systemLists: {
          include: {
            systemList: true,
          },
        },
      },
    });

    return {
      success: true,
      data: latest.map((item) => ({
        id: item.id,
        userId: String(item.userId),
        storyId: item.storyId,
        addedAt: item.addedAt.toISOString(),
        lastReadAt: item.lastReadAt?.toISOString(),
        lastChapterId: item.lastChapterId ?? undefined,
        isDownloaded: item.isDownloaded,
        downloadProgress: item.downloadProgress,
        customTags: item.tags.map((lt) => lt.tag.name),
        notes: item.notes ?? undefined,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      message: "Library synced successfully",
    };
  }

  async getSyncStatus(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const status = await this.prisma.libraryItem.aggregate({
        where: { userId: normalizedUserId },
        _max: {
          lastSyncedAt: true,
        },
        _count: true,
      });

      return {
        success: true,
        data: {
          lastSyncedAt: status._max.lastSyncedAt?.toISOString(),
          totalItems: status._count,
        },
        message: "Sync status retrieved",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to load sync status",
      };
    }
  }

  async getPendingSyncQueue(userId: string, deviceId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const items = await this.prisma.libraryItem.findMany({
      where: {
        userId: normalizedUserId,
        OR: [{ deviceId: null }, { deviceId: { not: deviceId } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return {
      success: true,
      data: items.map((item) => ({
        operationType: "UPSERT",
        entity: "library",
        payloadJson: JSON.stringify({
          id: item.id,
          storyId: item.storyId,
          lastReadAt: item.lastReadAt?.toISOString(),
          lastChapterId: item.lastChapterId,
          notes: item.notes,
          updatedAt: item.updatedAt.toISOString(),
        }),
      })),
      message: "Pending sync operations generated",
    };
  }

  async processSyncQueue(userId: string, operations: SyncQueueOperation[]) {
    const normalizedUserId = this.normalizeUserId(userId);
    let processedCount = 0;
    let failedCount = 0;

    for (const op of operations) {
      try {
        if (op.entity !== "library") {
          failedCount += 1;
          continue;
        }

        const payload = JSON.parse(op.payloadJson) as {
          storyId: string;
          lastReadAt?: string;
          lastChapterId?: string;
          notes?: string;
        };

        await this.prisma.libraryItem.upsert({
          where: {
            userId_storyId: {
              userId: normalizedUserId,
              storyId: payload.storyId,
            },
          },
          update: {
            lastReadAt: payload.lastReadAt ? new Date(payload.lastReadAt) : undefined,
            lastChapterId: payload.lastChapterId,
            notes: payload.notes,
            lastSyncedAt: new Date(),
          },
          create: {
            userId: normalizedUserId,
            storyId: payload.storyId,
            lastReadAt: payload.lastReadAt ? new Date(payload.lastReadAt) : undefined,
            lastChapterId: payload.lastChapterId,
            notes: payload.notes,
            lastSyncedAt: new Date(),
          },
        });

        processedCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    return {
      success: true,
      data: {
        processedCount,
        failedCount,
      },
      message: "Sync queue processed",
    };
  }
}

