import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

interface CreateTagPayload {
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  parentTagId?: string;
}

interface UpdateTagPayload {
  userId: string;
  tagId: string;
  name?: string;
  color?: string;
  icon?: string;
  parentTagId?: string | null;
}

@Injectable()
export class TagsService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async createTag(payload: CreateTagPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const tag = await this.prisma.tag.create({
        data: {
          userId: normalizedUserId,
          name: payload.name,
          color: payload.color,
          icon: payload.icon,
          parentTagId: payload.parentTagId ?? undefined,
        },
      });

      return {
        success: true,
        data: tag,
        message: "Tag created",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to create tag",
      };
    }
  }

  async updateTag(payload: UpdateTagPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const tag = await this.prisma.tag.update({
        where: {
          id: payload.tagId,
          userId: normalizedUserId,
        },
        data: {
          name: payload.name,
          color: payload.color,
          icon: payload.icon,
          parentTagId: payload.parentTagId ?? undefined,
        },
      });

      return {
        success: true,
        data: tag,
        message: "Tag updated",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update tag",
      };
    }
  }

  async deleteTag(userId: string, tagId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      await this.prisma.$transaction([
        this.prisma.libraryTag.deleteMany({
          where: { tagId },
        }),
        this.prisma.tag.deleteMany({
          where: { id: tagId, userId: normalizedUserId },
        }),
      ]);

      return {
        success: true,
        message: "Tag deleted",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete tag",
      };
    }
  }

  async getAllTags(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const tags = await this.prisma.tag.findMany({
        where: { userId: normalizedUserId },
        orderBy: [{ parentTagId: "asc" }, { name: "asc" }],
      });

      return {
        success: true,
        data: tags,
        message: "Tags retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load tags",
      };
    }
  }

  async getTagHierarchy(userId: string) {
    const response = await this.getAllTags(userId);
    if (!response.success || !response.data) {
      return response;
    }

    const map: Record<
      string,
      {
        id: string;
        name: string;
        color?: string | null;
        icon?: string | null;
        children: any[];
      }
    > = {};

    response.data.forEach((tag) => {
      map[tag.id] = { ...tag, children: [] };
    });

    const roots: typeof map[string][] = [];

    response.data.forEach((tag) => {
      if (tag.parentTagId && map[tag.parentTagId]) {
        map[tag.parentTagId].children.push(map[tag.id]);
      } else {
        roots.push(map[tag.id]);
      }
    });

    return {
      success: true,
      data: roots,
      message: "Tag hierarchy retrieved",
    };
  }

  async applyTagToLibrary(userId: string, tagId: string, libraryItemId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      await this.prisma.tag.findFirstOrThrow({
        where: { id: tagId, userId: normalizedUserId },
      });

      await this.prisma.libraryTag.upsert({
        where: {
          libraryItemId_tagId: {
            libraryItemId,
            tagId,
          },
        },
        update: {},
        create: {
          libraryItemId,
          tagId,
        },
      });

      return {
        success: true,
        message: "Tag applied to library item",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to apply tag",
      };
    }
  }

  async removeTagFromLibrary(tagId: string, libraryItemId: string) {
    try {
      await this.prisma.libraryTag.deleteMany({
        where: {
          tagId,
          libraryItemId,
        },
      });

      return {
        success: true,
        message: "Tag removed from library item",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove tag",
      };
    }
  }

  async getTagSuggestions(userId: string, limit = 5) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const tags = await this.prisma.tag.findMany({
        where: { userId: normalizedUserId },
        orderBy: { name: "asc" },
        take: limit,
      });

      return {
        success: true,
        data: tags,
        message: "Tag suggestions generated",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to fetch tag suggestions",
      };
    }
  }
}

