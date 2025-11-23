import { Injectable } from "@nestjs/common";
import { Prisma, SystemListType } from "@prisma/users-service-client";
import { DatabaseService } from "../../common/database/database.service";

interface CreateFilteredViewPayload {
  userId: string;
  name: string;
  description?: string;
  query: FilterQuery;
  isAutoUpdating?: boolean;
}

interface UpdateFilteredViewPayload {
  userId: string;
  viewId: string;
  name?: string;
  description?: string;
  query?: FilterQuery;
  isAutoUpdating?: boolean;
}

interface FilterQuery extends Record<string, unknown> {
  tagIds?: string[];
  systemListType?: SystemListType;
  isDownloaded?: boolean;
  search?: string;
}

@Injectable()
export class FilteredViewsService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private buildLibraryFilter(userId: number, query: FilterQuery): Prisma.LibraryItemWhereInput {
    const where: Prisma.LibraryItemWhereInput = {
      userId,
    };

    if (query.isDownloaded !== undefined) {
      where.isDownloaded = query.isDownloaded;
    }

    if (query.search) {
      where.OR = [
        { storyId: { contains: query.search, mode: "insensitive" } },
        { notes: { contains: query.search, mode: "insensitive" } },
        { authorName: { contains: query.search, mode: "insensitive" } },
        { seriesName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.tagIds?.length) {
      where.tags = {
        some: {
          tagId: {
            in: query.tagIds,
          },
        },
      };
    }

    if (query.systemListType) {
      where.systemLists = {
        some: {
          systemList: {
            listType: query.systemListType,
          },
        },
      };
    }

    return where;
  }

  async createFilteredView(payload: CreateFilteredViewPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const view = await this.prisma.filteredView.create({
        data: {
          userId: normalizedUserId,
          name: payload.name,
          description: payload.description,
          query: payload.query as Prisma.InputJsonValue,
          isAutoUpdating: payload.isAutoUpdating ?? false,
          displayOrder: await this.prisma.filteredView.count({
            where: { userId: normalizedUserId },
          }),
        },
      });

      return {
        success: true,
        data: view,
        message: "Filtered view created",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to create filtered view",
      };
    }
  }

  async updateFilteredView(payload: UpdateFilteredViewPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const view = await this.prisma.filteredView.update({
        where: {
          id: payload.viewId,
          userId: normalizedUserId,
        },
        data: {
          name: payload.name,
          description: payload.description,
          query: payload.query as Prisma.InputJsonValue | undefined,
          isAutoUpdating: payload.isAutoUpdating,
        },
      });

      return {
        success: true,
        data: view,
        message: "Filtered view updated",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update filtered view",
      };
    }
  }

  async deleteFilteredView(userId: string, viewId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      await this.prisma.filteredView.delete({
        where: { id: viewId, userId: normalizedUserId },
      });

      return {
        success: true,
        message: "Filtered view deleted",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete filtered view",
      };
    }
  }

  async getFilteredViews(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const views = await this.prisma.filteredView.findMany({
        where: { userId: normalizedUserId },
        orderBy: { displayOrder: "asc" },
      });

      return {
        success: true,
        data: views,
        message: "Filtered views retrieved",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load filtered views",
      };
    }
  }

  async executeFilter(userId: string, query: FilterQuery) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const where = this.buildLibraryFilter(normalizedUserId, query);
      const items = await this.prisma.libraryItem.findMany({
        where,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return {
        success: true,
        data: items,
        message: "Filtered view executed",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to execute filtered view",
      };
    }
  }
}

