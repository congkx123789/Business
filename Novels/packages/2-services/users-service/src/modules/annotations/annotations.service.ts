import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class AnnotationsService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }

    return parsed;
  }

  async getAnnotations(userId: string, filters: { chapterId?: string; storyId?: string; sourceType?: string } = {}) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const annotations = await this.prisma.annotation.findMany({
        where: {
          userId: normalizedUserId,
          ...(filters.chapterId ? { chapterId: filters.chapterId } : {}),
          ...(filters.storyId ? { storyId: filters.storyId } : {}),
          ...(filters.sourceType ? { sourceType: filters.sourceType as any } : {}),
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return {
        success: true,
        data: annotations.map((annotation) => ({
          id: annotation.id,
          storyId: annotation.storyId ?? undefined,
          chapterId: annotation.chapterId ?? undefined,
          selectedText: annotation.selectedText,
          startOffset: annotation.startOffset,
          endOffset: annotation.endOffset,
          note: annotation.note,
          color: annotation.color ?? undefined,
          createdAt: annotation.createdAt.getTime(),
        })),
        message: "Annotations retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to get annotations",
      };
    }
  }

  async createAnnotation(
    userId: string,
    storyId: string | undefined,
    chapterId: string | undefined,
    selectedText: string,
    startOffset: number,
    endOffset: number,
    note: string,
    color?: string
  ) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);

      const annotation = await this.prisma.annotation.create({
        data: {
          userId: normalizedUserId,
          storyId,
          chapterId,
          selectedText,
          startOffset,
          endOffset,
          note,
          color,
        },
      });

      return {
        success: true,
        data: {
          id: annotation.id,
          storyId: annotation.storyId ?? undefined,
          chapterId: annotation.chapterId ?? undefined,
          selectedText: annotation.selectedText,
          startOffset: annotation.startOffset,
          endOffset: annotation.endOffset,
          note: annotation.note,
          color: annotation.color ?? undefined,
          createdAt: annotation.createdAt.getTime(),
        },
        message: "Annotation created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to create annotation",
      };
    }
  }

  async updateAnnotation(annotationId: string, note?: string, color?: string) {
    try {
      const updated = await this.prisma.annotation.update({
        where: { id: annotationId },
        data: {
          ...(note !== undefined ? { note } : {}),
          ...(color !== undefined ? { color } : {}),
        },
      });

      return {
        success: true,
        data: {
          id: updated.id,
          note: updated.note,
          color: updated.color ?? undefined,
        },
        message: "Annotation updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update annotation",
      };
    }
  }

  async deleteAnnotation(annotationId: string) {
    try {
      await this.prisma.annotation.delete({
        where: { id: annotationId },
      });

      return {
        success: true,
        message: "Annotation deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete annotation",
      };
    }
  }
}

