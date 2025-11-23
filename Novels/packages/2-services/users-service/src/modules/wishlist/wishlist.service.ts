import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

interface AddToWishlistPayload {
  userId: string;
  storyId: string;
  priority?: number;
  notes?: string;
}

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private mapWishlistItem(item: {
    id: string;
    storyId: string;
    priority: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item.id,
      storyId: item.storyId,
      priority: item.priority ?? undefined,
      notes: item.notes ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async getWishlist(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const items = await this.prisma.wishlist.findMany({
        where: { userId: normalizedUserId },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      });

      return {
        success: true,
        data: items.map((item) => this.mapWishlistItem(item)),
        message: "Wishlist retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load wishlist",
      };
    }
  }

  async addToWishlist(payload: AddToWishlistPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const item = await this.prisma.wishlist.upsert({
        where: {
          userId_storyId: {
            userId: normalizedUserId,
            storyId: payload.storyId,
          },
        },
        update: {
          priority: payload.priority,
          notes: payload.notes,
        },
        create: {
          userId: normalizedUserId,
          storyId: payload.storyId,
          priority: payload.priority,
          notes: payload.notes,
        },
      });

      return {
        success: true,
        data: this.mapWishlistItem(item),
        message: "Story added to wishlist",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to add story to wishlist",
      };
    }
  }

  async removeFromWishlist(userId: string, storyId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const result = await this.prisma.wishlist.deleteMany({
        where: {
          userId: normalizedUserId,
          storyId,
        },
      });

      if (result.count === 0) {
        return {
          success: false,
          message: "Wishlist item not found",
        };
      }

      return {
        success: true,
        message: "Wishlist item removed",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove wishlist item",
      };
    }
  }

  async moveToLibrary(userId: string, storyId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);

      await this.prisma.$transaction([
        this.prisma.libraryItem.upsert({
          where: {
            userId_storyId: {
              userId: normalizedUserId,
              storyId,
            },
          },
          update: { updatedAt: new Date() },
          create: {
            userId: normalizedUserId,
            storyId,
          },
        }),
        this.prisma.wishlist.deleteMany({
          where: { userId: normalizedUserId, storyId },
        }),
      ]);

      return {
        success: true,
        message: "Story moved from wishlist to library",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to move story to library",
      };
    }
  }
}
