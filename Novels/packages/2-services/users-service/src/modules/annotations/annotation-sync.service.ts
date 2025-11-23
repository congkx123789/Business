import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { Annotation, AnnotationSourceType } from "@prisma/users-service-client";

interface SyncAnnotationPayload {
  id: string;
  storyId?: string;
  chapterId?: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  note: string;
  color?: string;
  sourceType?: AnnotationSourceType;
  sourceId?: string;
  sourceUrl?: string;
  unifiedAt?: string;
  lastReviewedAt?: string;
  reviewCount?: number;
  nextReviewDate?: string;
  isArchived?: boolean;
  syncVersion: number;
  updatedAt: string;
  deleted?: boolean;
}

interface SyncAnnotationResult {
  syncedData: any[];
  conflicts: any[];
}

@Injectable()
export class AnnotationSyncService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private mapAnnotation(annotation: Annotation) {
    return {
      id: annotation.id,
      userId: annotation.userId,
      storyId: annotation.storyId ?? undefined,
      chapterId: annotation.chapterId ?? undefined,
      selectedText: annotation.selectedText,
      startOffset: annotation.startOffset,
      endOffset: annotation.endOffset,
      note: annotation.note,
      color: annotation.color ?? undefined,
      sourceType: annotation.sourceType,
      sourceId: annotation.sourceId ?? undefined,
      sourceUrl: annotation.sourceUrl ?? undefined,
      unifiedAt: annotation.unifiedAt?.toISOString() ?? undefined,
      lastReviewedAt: annotation.lastReviewedAt?.toISOString() ?? undefined,
      reviewCount: annotation.reviewCount,
      nextReviewDate: annotation.nextReviewDate?.toISOString() ?? undefined,
      isArchived: annotation.isArchived,
      createdAt: annotation.createdAt.toISOString(),
      updatedAt: annotation.updatedAt.toISOString(),
    };
  }

  /**
   * Syncs annotations across devices using last-write-wins strategy
   * CRITICAL: Losing highlights/notes is catastrophic - user's intellectual property
   */
  async syncAnnotations(userId: string, deviceId: string, localData: SyncAnnotationPayload[]): Promise<SyncAnnotationResult> {
    const normalizedUserId = this.normalizeUserId(userId);
    const syncedData: any[] = [];
    const conflicts: any[] = [];

    // Get all annotations from server
    const serverAnnotations = await this.prisma.annotation.findMany({
      where: { userId: normalizedUserId },
    });

    const serverAnnotationMap = new Map(serverAnnotations.map((a) => [a.id, a]));

    // Process local data
    for (const localAnnotation of localData) {
      const serverAnnotation = serverAnnotationMap.get(localAnnotation.id);

      if (localAnnotation.deleted) {
        // Delete annotation (only if it exists on server)
        if (serverAnnotation) {
          await this.prisma.annotation.delete({
            where: { id: localAnnotation.id },
          });
        }
        continue;
      }

      if (!serverAnnotation) {
        // New annotation - create it
        const created = await this.prisma.annotation.create({
          data: {
            id: localAnnotation.id,
            userId: normalizedUserId,
            storyId: localAnnotation.storyId ?? null,
            chapterId: localAnnotation.chapterId ?? null,
            selectedText: localAnnotation.selectedText,
            startOffset: localAnnotation.startOffset,
            endOffset: localAnnotation.endOffset,
            note: localAnnotation.note,
            color: localAnnotation.color ?? null,
            sourceType: localAnnotation.sourceType ?? "STORY",
            sourceId: localAnnotation.sourceId ?? null,
            sourceUrl: localAnnotation.sourceUrl ?? null,
            unifiedAt: localAnnotation.unifiedAt ? new Date(localAnnotation.unifiedAt) : null,
            lastReviewedAt: localAnnotation.lastReviewedAt ? new Date(localAnnotation.lastReviewedAt) : null,
            reviewCount: localAnnotation.reviewCount ?? 0,
            nextReviewDate: localAnnotation.nextReviewDate ? new Date(localAnnotation.nextReviewDate) : null,
            isArchived: localAnnotation.isArchived ?? false,
          },
        });
        syncedData.push(this.mapAnnotation(created));
      } else {
        // Existing annotation - check for conflicts
        const localUpdatedAt = new Date(localAnnotation.updatedAt);
        const serverUpdatedAt = serverAnnotation.updatedAt;

        if (localUpdatedAt > serverUpdatedAt) {
          // Local is newer - update server
          const updated = await this.prisma.annotation.update({
            where: { id: localAnnotation.id },
            data: {
              storyId: localAnnotation.storyId ?? null,
              chapterId: localAnnotation.chapterId ?? null,
              selectedText: localAnnotation.selectedText,
              startOffset: localAnnotation.startOffset,
              endOffset: localAnnotation.endOffset,
              note: localAnnotation.note,
              color: localAnnotation.color ?? null,
              sourceType: localAnnotation.sourceType ?? serverAnnotation.sourceType,
              sourceId: localAnnotation.sourceId ?? null,
              sourceUrl: localAnnotation.sourceUrl ?? null,
              unifiedAt: localAnnotation.unifiedAt ? new Date(localAnnotation.unifiedAt) : serverAnnotation.unifiedAt,
              lastReviewedAt: localAnnotation.lastReviewedAt ? new Date(localAnnotation.lastReviewedAt) : serverAnnotation.lastReviewedAt,
              reviewCount: localAnnotation.reviewCount ?? serverAnnotation.reviewCount,
              nextReviewDate: localAnnotation.nextReviewDate ? new Date(localAnnotation.nextReviewDate) : serverAnnotation.nextReviewDate,
              isArchived: localAnnotation.isArchived ?? serverAnnotation.isArchived,
            },
          });
          syncedData.push(this.mapAnnotation(updated));
        } else if (localUpdatedAt < serverUpdatedAt) {
          // Server is newer - return server data
          syncedData.push(this.mapAnnotation(serverAnnotation));
        } else {
          // Same timestamp - check syncVersion
          if (localAnnotation.syncVersion !== serverAnnotation.updatedAt.getTime()) {
            conflicts.push({
              id: localAnnotation.id,
              local: localAnnotation,
              server: this.mapAnnotation(serverAnnotation),
            });
          } else {
            syncedData.push(this.mapAnnotation(serverAnnotation));
          }
        }
      }
    }

    // Add server annotations that don't exist in local data
    for (const serverAnnotation of serverAnnotations) {
      const existsInLocal = localData.some((a) => a.id === serverAnnotation.id);
      if (!existsInLocal) {
        syncedData.push(this.mapAnnotation(serverAnnotation));
      }
    }

    return { syncedData, conflicts };
  }

  /**
   * Enhanced sync with explicit conflict resolution strategies
   * CRITICAL: This is the strongest retention mechanism - data loss = immediate churn
   */
  async syncWithConflictResolution(
    userId: string,
    deviceId: string,
    localData: SyncAnnotationPayload[],
    conflictStrategy: "last-write-wins" | "server-wins" | "client-wins" | "merge" = "last-write-wins"
  ): Promise<SyncAnnotationResult> {
    const normalizedUserId = this.normalizeUserId(userId);
    const syncedData: any[] = [];
    const conflicts: any[] = [];

    // Get all annotations from server
    const serverAnnotations = await this.prisma.annotation.findMany({
      where: { userId: normalizedUserId },
    });

    const serverAnnotationMap = new Map(serverAnnotations.map((a) => [a.id, a]));

    // Process local data
    for (const localAnnotation of localData) {
      const serverAnnotation = serverAnnotationMap.get(localAnnotation.id);

      if (localAnnotation.deleted) {
        // Delete annotation (only if it exists on server)
        if (serverAnnotation) {
          await this.prisma.annotation.delete({
            where: { id: localAnnotation.id },
          });
        }
        continue;
      }

      if (!serverAnnotation) {
        // New annotation - create it
        const created = await this.prisma.annotation.create({
          data: {
            id: localAnnotation.id,
            userId: normalizedUserId,
            storyId: localAnnotation.storyId ?? null,
            chapterId: localAnnotation.chapterId ?? null,
            selectedText: localAnnotation.selectedText,
            startOffset: localAnnotation.startOffset,
            endOffset: localAnnotation.endOffset,
            note: localAnnotation.note,
            color: localAnnotation.color ?? null,
            sourceType: localAnnotation.sourceType ?? "STORY",
            sourceId: localAnnotation.sourceId ?? null,
            sourceUrl: localAnnotation.sourceUrl ?? null,
            unifiedAt: localAnnotation.unifiedAt ? new Date(localAnnotation.unifiedAt) : null,
            lastReviewedAt: localAnnotation.lastReviewedAt ? new Date(localAnnotation.lastReviewedAt) : null,
            reviewCount: localAnnotation.reviewCount ?? 0,
            nextReviewDate: localAnnotation.nextReviewDate ? new Date(localAnnotation.nextReviewDate) : null,
            isArchived: localAnnotation.isArchived ?? false,
          },
        });
        syncedData.push(this.mapAnnotation(created));
      } else {
        // Existing annotation - apply conflict strategy
        const localUpdatedAt = new Date(localAnnotation.updatedAt);
        const serverUpdatedAt = serverAnnotation.updatedAt;

        if (conflictStrategy === "server-wins") {
          syncedData.push(this.mapAnnotation(serverAnnotation));
        } else if (conflictStrategy === "client-wins") {
          const updated = await this.prisma.annotation.update({
            where: { id: localAnnotation.id },
            data: {
              storyId: localAnnotation.storyId ?? null,
              chapterId: localAnnotation.chapterId ?? null,
              selectedText: localAnnotation.selectedText,
              startOffset: localAnnotation.startOffset,
              endOffset: localAnnotation.endOffset,
              note: localAnnotation.note,
              color: localAnnotation.color ?? null,
              sourceType: localAnnotation.sourceType ?? serverAnnotation.sourceType,
              sourceId: localAnnotation.sourceId ?? null,
              sourceUrl: localAnnotation.sourceUrl ?? null,
              unifiedAt: localAnnotation.unifiedAt ? new Date(localAnnotation.unifiedAt) : serverAnnotation.unifiedAt,
              lastReviewedAt: localAnnotation.lastReviewedAt ? new Date(localAnnotation.lastReviewedAt) : serverAnnotation.lastReviewedAt,
              reviewCount: localAnnotation.reviewCount ?? serverAnnotation.reviewCount,
              nextReviewDate: localAnnotation.nextReviewDate ? new Date(localAnnotation.nextReviewDate) : serverAnnotation.nextReviewDate,
              isArchived: localAnnotation.isArchived ?? serverAnnotation.isArchived,
            },
          });
          syncedData.push(this.mapAnnotation(updated));
        } else if (conflictStrategy === "merge") {
          // Merge strategy: combine notes if different, preserve both selectedText if different
          const mergedNote = serverAnnotation.note && localAnnotation.note && serverAnnotation.note !== localAnnotation.note
            ? `${serverAnnotation.note}\n\n---\n\n${localAnnotation.note}`
            : localAnnotation.note || serverAnnotation.note;

          // Use the longer selectedText (more complete)
          const selectedText = localAnnotation.selectedText.length > serverAnnotation.selectedText.length
            ? localAnnotation.selectedText
            : serverAnnotation.selectedText;

          // Use the broader range (earlier start, later end)
          const startOffset = Math.min(localAnnotation.startOffset, serverAnnotation.startOffset);
          const endOffset = Math.max(localAnnotation.endOffset, serverAnnotation.endOffset);

          const updated = await this.prisma.annotation.update({
            where: { id: localAnnotation.id },
            data: {
              selectedText,
              startOffset,
              endOffset,
              note: mergedNote,
              // Preserve review data from the more recent one
              lastReviewedAt: localUpdatedAt > serverUpdatedAt
                ? (localAnnotation.lastReviewedAt ? new Date(localAnnotation.lastReviewedAt) : null)
                : serverAnnotation.lastReviewedAt,
              reviewCount: localUpdatedAt > serverUpdatedAt
                ? (localAnnotation.reviewCount ?? serverAnnotation.reviewCount)
                : serverAnnotation.reviewCount,
              nextReviewDate: localUpdatedAt > serverUpdatedAt
                ? (localAnnotation.nextReviewDate ? new Date(localAnnotation.nextReviewDate) : null)
                : serverAnnotation.nextReviewDate,
            },
          });
          syncedData.push(this.mapAnnotation(updated));
        } else {
          // last-write-wins (default)
          if (localUpdatedAt > serverUpdatedAt) {
            const updated = await this.prisma.annotation.update({
              where: { id: localAnnotation.id },
              data: {
                storyId: localAnnotation.storyId ?? null,
                chapterId: localAnnotation.chapterId ?? null,
                selectedText: localAnnotation.selectedText,
                startOffset: localAnnotation.startOffset,
                endOffset: localAnnotation.endOffset,
                note: localAnnotation.note,
                color: localAnnotation.color ?? null,
                sourceType: localAnnotation.sourceType ?? serverAnnotation.sourceType,
                sourceId: localAnnotation.sourceId ?? null,
                sourceUrl: localAnnotation.sourceUrl ?? null,
                unifiedAt: localAnnotation.unifiedAt ? new Date(localAnnotation.unifiedAt) : serverAnnotation.unifiedAt,
                lastReviewedAt: localAnnotation.lastReviewedAt ? new Date(localAnnotation.lastReviewedAt) : serverAnnotation.lastReviewedAt,
                reviewCount: localAnnotation.reviewCount ?? serverAnnotation.reviewCount,
                nextReviewDate: localAnnotation.nextReviewDate ? new Date(localAnnotation.nextReviewDate) : serverAnnotation.nextReviewDate,
                isArchived: localAnnotation.isArchived ?? serverAnnotation.isArchived,
              },
            });
            syncedData.push(this.mapAnnotation(updated));
          } else {
            syncedData.push(this.mapAnnotation(serverAnnotation));
          }
        }
      }
    }

    // Add server annotations that don't exist in local data
    for (const serverAnnotation of serverAnnotations) {
      const existsInLocal = localData.some((a) => a.id === serverAnnotation.id);
      if (!existsInLocal) {
        syncedData.push(this.mapAnnotation(serverAnnotation));
      }
    }

    return { syncedData, conflicts };
  }

  /**
   * Gets sync status for annotations
   */
  async getSyncStatus(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);

    const annotations = await this.prisma.annotation.findMany({
      where: { userId: normalizedUserId },
      orderBy: { updatedAt: "desc" },
      take: 1,
    });

    return {
      lastSyncedAt: annotations[0]?.updatedAt.toISOString() ?? null,
      totalAnnotations: await this.prisma.annotation.count({
        where: { userId: normalizedUserId },
      }),
    };
  }
}

