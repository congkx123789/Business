import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class LibraryAutoOrganizationService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async autoGroupByAuthor(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const items = await this.prisma.libraryItem.findMany({
        where: {
          userId: normalizedUserId,
          authorId: { not: null },
        },
        select: {
          id: true,
          storyId: true,
          authorId: true,
          authorName: true,
        },
      });

      const groups: Record<
        string,
        {
          authorId: string;
          authorName?: string | null;
          libraryItems: { id: string; storyId: string }[];
        }
      > = {};

      items.forEach((item) => {
        if (!item.authorId) {
          return;
        }
        if (!groups[item.authorId]) {
          groups[item.authorId] = {
            authorId: item.authorId,
            authorName: item.authorName,
            libraryItems: [],
          };
        }
        groups[item.authorId].libraryItems.push({ id: item.id, storyId: item.storyId });
      });

      return {
        success: true,
        data: Object.values(groups),
        message: "Auto-grouped library items by author",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to group by author",
      };
    }
  }

  async autoGroupBySeries(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const items = await this.prisma.libraryItem.findMany({
        where: {
          userId: normalizedUserId,
          seriesId: { not: null },
        },
        select: {
          id: true,
          storyId: true,
          seriesId: true,
          seriesName: true,
        },
      });

      const groups: Record<
        string,
        {
          seriesId: string;
          seriesName?: string | null;
          libraryItems: { id: string; storyId: string }[];
        }
      > = {};

      items.forEach((item) => {
        if (!item.seriesId) {
          return;
        }
        if (!groups[item.seriesId]) {
          groups[item.seriesId] = {
            seriesId: item.seriesId,
            seriesName: item.seriesName,
            libraryItems: [],
          };
        }
        groups[item.seriesId].libraryItems.push({ id: item.id, storyId: item.storyId });
      });

      return {
        success: true,
        data: Object.values(groups),
        message: "Auto-grouped library items by series",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to group by series",
      };
    }
  }

  async getBooksByAuthor(userId: string, authorId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const items = await this.prisma.libraryItem.findMany({
        where: {
          userId: normalizedUserId,
          authorId,
        },
      });

      return {
        success: true,
        data: items,
        message: "Books retrieved for author",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to fetch books for author",
      };
    }
  }

  async getBooksBySeries(userId: string, seriesId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const items = await this.prisma.libraryItem.findMany({
        where: {
          userId: normalizedUserId,
          seriesId,
        },
      });

      return {
        success: true,
        data: items,
        message: "Books retrieved for series",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to fetch books for series",
      };
    }
  }
}

