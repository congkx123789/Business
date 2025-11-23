import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { Bookmark } from "@prisma/users-service-client";

interface SyncBookmarkPayload {
  id: string;
  storyId: string;
  chapterId: string;
  position: number;
  note?: string;
  syncVersion: number;
  updatedAt: string;
  deleted?: boolean;
}

interface SyncBookmarkResult {
  syncedData: any[];
  conflicts: any[];
}

@Injectable()
export class BookmarkSyncService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private mapBookmark(bookmark: Bookmark) {
    return {
      id: bookmark.id,
      userId: bookmark.userId,
      storyId: bookmark.storyId,
      chapterId: bookmark.chapterId,
      position: bookmark.position,
      note: bookmark.note ?? undefined,
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
    };
  }

  /**
   * Syncs bookmarks across devices using last-write-wins strategy
   */
  async syncBookmarks(userId: string, deviceId: string, localData: SyncBookmarkPayload[]): Promise<SyncBookmarkResult> {
    const normalizedUserId = this.normalizeUserId(userId);
    const syncedData: any[] = [];
    const conflicts: any[] = [];

    // Get all bookmarks from server
    const serverBookmarks = await this.prisma.bookmark.findMany({
      where: { userId: normalizedUserId },
    });

    const serverBookmarkMap = new Map(serverBookmarks.map((b) => [b.id, b]));

    // Process local data
    for (const localBookmark of localData) {
      const serverBookmark = serverBookmarkMap.get(localBookmark.id);

      if (localBookmark.deleted) {
        // Delete bookmark
        if (serverBookmark) {
          await this.prisma.bookmark.delete({
            where: { id: localBookmark.id },
          });
        }
        continue;
      }

      if (!serverBookmark) {
        // New bookmark - create it
        const created = await this.prisma.bookmark.create({
          data: {
            id: localBookmark.id,
            userId: normalizedUserId,
            storyId: localBookmark.storyId,
            chapterId: localBookmark.chapterId,
            position: localBookmark.position,
            note: localBookmark.note ?? null,
          },
        });
        syncedData.push(this.mapBookmark(created));
      } else {
        // Existing bookmark - check for conflicts
        const localUpdatedAt = new Date(localBookmark.updatedAt);
        const serverUpdatedAt = serverBookmark.updatedAt;

        if (localUpdatedAt > serverUpdatedAt) {
          // Local is newer - update server
          const updated = await this.prisma.bookmark.update({
            where: { id: localBookmark.id },
            data: {
              storyId: localBookmark.storyId,
              chapterId: localBookmark.chapterId,
              position: localBookmark.position,
              note: localBookmark.note ?? null,
            },
          });
          syncedData.push(this.mapBookmark(updated));
        } else if (localUpdatedAt < serverUpdatedAt) {
          // Server is newer - return server data
          syncedData.push(this.mapBookmark(serverBookmark));
        } else {
          // Same timestamp - check syncVersion
          if (localBookmark.syncVersion !== serverBookmark.updatedAt.getTime()) {
            conflicts.push({
              id: localBookmark.id,
              local: localBookmark,
              server: this.mapBookmark(serverBookmark),
            });
          } else {
            syncedData.push(this.mapBookmark(serverBookmark));
          }
        }
      }
    }

    // Add server bookmarks that don't exist in local data
    for (const serverBookmark of serverBookmarks) {
      const existsInLocal = localData.some((b) => b.id === serverBookmark.id);
      if (!existsInLocal) {
        syncedData.push(this.mapBookmark(serverBookmark));
      }
    }

    return { syncedData, conflicts };
  }

  /**
   * Enhanced sync with explicit conflict resolution strategies
   */
  async syncWithConflictResolution(
    userId: string,
    deviceId: string,
    localData: SyncBookmarkPayload[],
    conflictStrategy: "last-write-wins" | "server-wins" | "client-wins" | "merge" = "last-write-wins"
  ): Promise<SyncBookmarkResult> {
    const normalizedUserId = this.normalizeUserId(userId);
    const syncedData: any[] = [];
    const conflicts: any[] = [];

    // Get all bookmarks from server
    const serverBookmarks = await this.prisma.bookmark.findMany({
      where: { userId: normalizedUserId },
    });

    const serverBookmarkMap = new Map(serverBookmarks.map((b) => [b.id, b]));

    // Process local data
    for (const localBookmark of localData) {
      const serverBookmark = serverBookmarkMap.get(localBookmark.id);

      if (localBookmark.deleted) {
        // Delete bookmark
        if (serverBookmark) {
          await this.prisma.bookmark.delete({
            where: { id: localBookmark.id },
          });
        }
        continue;
      }

      if (!serverBookmark) {
        // New bookmark - create it
        const created = await this.prisma.bookmark.create({
          data: {
            id: localBookmark.id,
            userId: normalizedUserId,
            storyId: localBookmark.storyId,
            chapterId: localBookmark.chapterId,
            position: localBookmark.position,
            note: localBookmark.note ?? null,
          },
        });
        syncedData.push(this.mapBookmark(created));
      } else {
        // Existing bookmark - apply conflict strategy
        const localUpdatedAt = new Date(localBookmark.updatedAt);
        const serverUpdatedAt = serverBookmark.updatedAt;

        if (conflictStrategy === "server-wins") {
          syncedData.push(this.mapBookmark(serverBookmark));
        } else if (conflictStrategy === "client-wins") {
          const updated = await this.prisma.bookmark.update({
            where: { id: localBookmark.id },
            data: {
              storyId: localBookmark.storyId,
              chapterId: localBookmark.chapterId,
              position: localBookmark.position,
              note: localBookmark.note ?? null,
            },
          });
          syncedData.push(this.mapBookmark(updated));
        } else if (conflictStrategy === "merge") {
          // Merge strategy: combine notes if different, use newer position
          const mergedNote = serverBookmark.note && localBookmark.note && serverBookmark.note !== localBookmark.note
            ? `${serverBookmark.note}\n\n---\n\n${localBookmark.note}`
            : localBookmark.note ?? serverBookmark.note ?? null;

          const position = localUpdatedAt > serverUpdatedAt ? localBookmark.position : serverBookmark.position;

          const updated = await this.prisma.bookmark.update({
            where: { id: localBookmark.id },
            data: {
              position,
              note: mergedNote,
            },
          });
          syncedData.push(this.mapBookmark(updated));
        } else {
          // last-write-wins (default)
          if (localUpdatedAt > serverUpdatedAt) {
            const updated = await this.prisma.bookmark.update({
              where: { id: localBookmark.id },
              data: {
                storyId: localBookmark.storyId,
                chapterId: localBookmark.chapterId,
                position: localBookmark.position,
                note: localBookmark.note ?? null,
              },
            });
            syncedData.push(this.mapBookmark(updated));
          } else {
            syncedData.push(this.mapBookmark(serverBookmark));
          }
        }
      }
    }

    // Add server bookmarks that don't exist in local data
    for (const serverBookmark of serverBookmarks) {
      const existsInLocal = localData.some((b) => b.id === serverBookmark.id);
      if (!existsInLocal) {
        syncedData.push(this.mapBookmark(serverBookmark));
      }
    }

    return { syncedData, conflicts };
  }

  /**
   * Gets sync status for bookmarks
   */
  async getSyncStatus(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: normalizedUserId },
      orderBy: { updatedAt: "desc" },
      take: 1,
    });

    return {
      lastSyncedAt: bookmarks[0]?.updatedAt.toISOString() ?? null,
      totalBookmarks: await this.prisma.bookmark.count({
        where: { userId: normalizedUserId },
      }),
    };
  }
}

