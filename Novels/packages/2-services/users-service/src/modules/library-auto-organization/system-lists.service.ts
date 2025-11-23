import { Injectable } from "@nestjs/common";
import { SystemListType } from "@prisma/users-service-client";
import { DatabaseService } from "../../common/database/database.service";

interface UpdateSystemListPayload {
  userId: string;
  listType: SystemListType;
  libraryItemIds: string[];
}

@Injectable()
export class SystemListsService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private async getOrCreateSystemList(userId: number, listType: SystemListType) {
    const existing = await this.prisma.systemList.findFirst({
      where: { userId, listType },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.systemList.create({
      data: {
        userId,
        listType,
      },
    });
  }

  async getSystemLists(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const lists = await this.prisma.systemList.findMany({
        where: { userId: normalizedUserId },
        include: {
          items: {
            select: { libraryItemId: true },
          },
        },
      });

      return {
        success: true,
        data: lists.map((list) => ({
          id: list.id,
          listType: list.listType,
          items: list.items.map((item) => item.libraryItemId),
        })),
        message: "System lists retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load system lists",
      };
    }
  }

  async updateSystemList(payload: UpdateSystemListPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const list = await this.getOrCreateSystemList(normalizedUserId, payload.listType);

      await this.prisma.$transaction([
        this.prisma.librarySystemList.deleteMany({
          where: { systemListId: list.id },
        }),
        ...payload.libraryItemIds.map((libraryItemId) =>
          this.prisma.librarySystemList.create({
            data: {
              systemListId: list.id,
              libraryItemId,
            },
          })
        ),
      ]);

      return {
        success: true,
        message: "System list updated",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update system list",
      };
    }
  }
}

