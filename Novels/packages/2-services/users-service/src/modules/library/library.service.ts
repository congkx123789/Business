import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { LibraryItem, Prisma, SystemListType } from "@prisma/users-service-client";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

interface GetLibraryOptions {
  userId: string;
  page?: number;
  limit?: number;
  bookshelfId?: string;
  tagIds?: string[];
  systemListType?: string;
  sort?: string;
  search?: string;
}

interface UpdateLibraryItemPayload {
  userId: string;
  libraryItemId: string;
  notes?: string;
  customTags?: string[];
}

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }

    return parsed;
  }

  private normalizeStoryId(storyId: number | string) {
    return String(storyId);
  }

  private mapLibraryItem(
    item: LibraryItem & {
      tags?: { tagId: string; tag?: { id: string; name: string } }[];
      bookshelfItems?: { bookshelfId: string }[];
      systemLists?: { systemList: { listType: string } }[];
    }
  ) {
    return {
      id: item.id,
      userId: item.userId,
      storyId: item.storyId,
      addedAt: item.addedAt.toISOString(),
      lastReadAt: item.lastReadAt?.toISOString(),
      lastChapterId: item.lastChapterId ?? undefined,
      deviceId: item.deviceId ?? undefined,
      notes: item.notes ?? undefined,
      downloadStatus: item.downloadStatus,
      downloadProgress: item.downloadProgress,
      displayLayout: item.displayLayout,
      sortOrder: item.sortOrder,
      isDownloaded: item.isDownloaded,
      downloadSize: item.downloadSize?.toString(),
      customTags: item.tags?.map((tag) => tag.tag?.id ?? tag.tagId) ?? [],
      tagMetadata: item.tags?.map((tag) => ({
        id: tag.tag?.id ?? tag.tagId,
        name: tag.tag?.name ?? "",
      })),
      bookshelfIds: item.bookshelfItems?.map((entry) => entry.bookshelfId) ?? [],
      systemLists: item.systemLists?.map((entry) => entry.systemList.listType) ?? [],
    };
  }

  private buildOrder(sort?: string): Prisma.LibraryItemOrderByWithRelationInput {
    switch ((sort ?? "").toLowerCase()) {
      case "title":
        return { storyId: "asc" };
      case "progress":
        return { downloadProgress: "desc" };
      case "added":
        return { addedAt: "desc" };
      case "recent":
      default:
        return { updatedAt: "desc" };
    }
  }

  async getLibrary(options: GetLibraryOptions) {
    const normalizedUserId = this.normalizeUserId(options.userId);
    const page = Math.max(options.page ?? DEFAULT_PAGE, 1);
    const limit = Math.max(Math.min(options.limit ?? DEFAULT_LIMIT, 100), 1);
    const skip = (page - 1) * limit;

    const where: Prisma.LibraryItemWhereInput = {
      userId: normalizedUserId,
    };

    if (options.bookshelfId) {
      where.bookshelfItems = {
        some: {
          bookshelfId: options.bookshelfId,
        },
      };
    }

    if (options.tagIds?.length) {
      where.tags = {
        some: {
          tagId: {
            in: options.tagIds,
          },
        },
      };
    }

    if (options.systemListType) {
      where.systemLists = {
        some: {
          systemList: {
            listType: options.systemListType as SystemListType,
          },
        },
      };
    }

    if (options.search) {
      where.OR = [
        { storyId: { contains: options.search, mode: "insensitive" } },
        { notes: { contains: options.search, mode: "insensitive" } },
        { authorName: { contains: options.search, mode: "insensitive" } },
        { seriesName: { contains: options.search, mode: "insensitive" } },
      ];
    }

    try {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.libraryItem.findMany({
          where,
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
          orderBy: this.buildOrder(options.sort),
          skip,
          take: limit,
        }),
        this.prisma.libraryItem.count({ where }),
      ]);

      return {
        success: true,
        data: items.map((item) => this.mapLibraryItem(item)),
        total,
        page,
        limit,
        message: "Library retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error instanceof Error ? error.message : "Failed to load library",
      };
    }
  }

  async addToLibrary(userId: string, storyId: number | string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const storyKey = this.normalizeStoryId(storyId);

    try {
      const item = await this.prisma.libraryItem.upsert({
        where: {
          userId_storyId: {
            userId: normalizedUserId,
            storyId: storyKey,
          },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          userId: normalizedUserId,
          storyId: storyKey,
        },
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
        data: this.mapLibraryItem(item),
        message: "Story added to library successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to add story to library",
      };
    }
  }

  async updateLibraryItem(payload: UpdateLibraryItemPayload) {
    const normalizedUserId = this.normalizeUserId(payload.userId);
    try {
      const existing = await this.prisma.libraryItem.findFirst({
        where: {
          id: payload.libraryItemId,
          userId: normalizedUserId,
        },
      });

      if (!existing) {
        return {
          success: false,
          data: null,
          message: "Library item not found",
        };
      }

      await this.prisma.libraryItem.update({
        where: { id: payload.libraryItemId },
        data: {
          notes: payload.notes ?? existing.notes,
        },
      });

      if (payload.customTags) {
        await this.prisma.libraryTag.deleteMany({
          where: {
            libraryItemId: payload.libraryItemId,
          },
        });

        if (payload.customTags.length) {
          await this.prisma.$transaction(
            payload.customTags.map((tagId) =>
              this.prisma.libraryTag.create({
                data: {
                  libraryItemId: payload.libraryItemId,
                  tagId,
                },
              })
            )
          );
        }
      }

      const refreshed = await this.prisma.libraryItem.findUnique({
        where: { id: payload.libraryItemId },
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
        data: refreshed ? this.mapLibraryItem(refreshed) : null,
        message: "Library item updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update library item",
      };
    }
  }

  async removeFromLibrary(userId: string, storyId: number | string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const storyKey = this.normalizeStoryId(storyId);
    try {
      const result = await this.prisma.libraryItem.deleteMany({
        where: {
          userId: normalizedUserId,
          storyId: storyKey,
        },
      });

      if (result.count === 0) {
        return {
          success: false,
          message: "Library item not found",
        };
      }

      return {
        success: true,
        message: "Story removed from library successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove story from library",
      };
    }
  }
}
