import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }

    return parsed;
  }

  async getBookmarks(userId: string, storyId?: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const bookmarks = await this.prisma.bookmark.findMany({
        where: {
          userId: normalizedUserId,
          ...(storyId ? { storyId } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: bookmarks.map((bookmark) => ({
          id: bookmark.id,
          storyId: bookmark.storyId,
          chapterId: bookmark.chapterId,
          position: bookmark.position,
          note: bookmark.note ?? undefined,
          createdAt: bookmark.createdAt.getTime(),
        })),
        message: "Bookmarks retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to get bookmarks",
      };
    }
  }

  async createBookmark(userId: string, storyId: string, chapterId: string, position: number, note?: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);

      const bookmark = await this.prisma.bookmark.upsert({
        where: {
          userId_storyId_chapterId: {
            userId: normalizedUserId,
            storyId,
            chapterId,
          },
        },
        update: {
          position,
          note,
          updatedAt: new Date(),
        },
        create: {
          userId: normalizedUserId,
          storyId,
          chapterId,
          position,
          note,
        },
      });

      return {
        success: true,
        data: {
          id: bookmark.id,
          storyId: bookmark.storyId,
          chapterId: bookmark.chapterId,
          position: bookmark.position,
          note: bookmark.note ?? undefined,
          createdAt: bookmark.createdAt.getTime(),
        },
        message: "Bookmark saved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to create bookmark",
      };
    }
  }

  async deleteBookmark(bookmarkId: string) {
    try {
      await this.prisma.bookmark.delete({
        where: { id: bookmarkId },
      });

      return {
        success: true,
        message: "Bookmark deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete bookmark",
      };
    }
  }
}

