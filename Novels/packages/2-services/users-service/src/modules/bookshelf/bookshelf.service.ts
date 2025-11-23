import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

interface CreateBookshelfPayload {
  userId: string;
  name: string;
  description?: string;
}

interface UpdateBookshelfPayload {
  userId: string;
  bookshelfId: string;
  name?: string;
  description?: string;
}

interface ModifyBookshelfItemPayload {
  userId: string;
  bookshelfId: string;
  libraryItemId: string;
}

interface ReorderBookshelfPayload {
  userId: string;
  bookshelfId: string;
  order: string[];
}

interface MoveBookshelfItemPayload {
  userId: string;
  libraryItemId: string;
  fromBookshelfId: string;
  toBookshelfId: string;
}

@Injectable()
export class BookshelfService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private async assertBookshelfOwnership(userId: number, bookshelfId: string) {
    const bookshelf = await this.prisma.bookshelf.findUnique({
      where: { id: bookshelfId },
      select: { userId: true },
    });

    if (!bookshelf || bookshelf.userId !== userId) {
      throw new Error("Bookshelf not found");
    }
  }

  private mapBookshelf(bookshelf: {
    id: string;
    name: string;
    description: string | null;
    displayOrder: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { items: number };
  }) {
    return {
      id: bookshelf.id,
      name: bookshelf.name,
      description: bookshelf.description ?? undefined,
      displayOrder: bookshelf.displayOrder,
      isDefault: bookshelf.isDefault,
      createdAt: bookshelf.createdAt.toISOString(),
      updatedAt: bookshelf.updatedAt.toISOString(),
      itemCount: bookshelf._count?.items ?? undefined,
    };
  }

  async getBookshelves(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const shelves = await this.prisma.bookshelf.findMany({
        where: { userId: normalizedUserId },
        orderBy: { displayOrder: "asc" },
        include: {
          _count: {
            select: { items: true },
          },
        },
      });

      return {
        success: true,
        data: shelves.map((shelf) => this.mapBookshelf(shelf)),
        message: "Bookshelves retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to load bookshelves",
      };
    }
  }

  async createBookshelf(payload: CreateBookshelfPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      const displayOrder = await this.prisma.bookshelf.count({
        where: { userId: normalizedUserId },
      });

      const bookshelf = await this.prisma.bookshelf.create({
        data: {
          userId: normalizedUserId,
          name: payload.name,
          description: payload.description,
          displayOrder,
          isDefault: false,
        },
      });

      return {
        success: true,
        data: this.mapBookshelf(bookshelf),
        message: "Bookshelf created",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to create bookshelf",
      };
    }
  }

  async updateBookshelf(payload: UpdateBookshelfPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      await this.assertBookshelfOwnership(normalizedUserId, payload.bookshelfId);

      const bookshelf = await this.prisma.bookshelf.update({
        where: { id: payload.bookshelfId },
        data: {
          name: payload.name,
          description: payload.description,
        },
      });

      return {
        success: true,
        data: this.mapBookshelf(bookshelf),
        message: "Bookshelf updated",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update bookshelf",
      };
    }
  }

  async deleteBookshelf(userId: string, bookshelfId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      await this.assertBookshelfOwnership(normalizedUserId, bookshelfId);

      await this.prisma.$transaction([
        this.prisma.bookshelfItem.deleteMany({
          where: { bookshelfId },
        }),
        this.prisma.bookshelf.delete({
          where: { id: bookshelfId },
        }),
      ]);

      return {
        success: true,
        message: "Bookshelf deleted",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete bookshelf",
      };
    }
  }

  async addToBookshelf(payload: ModifyBookshelfItemPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      await this.assertBookshelfOwnership(normalizedUserId, payload.bookshelfId);

      const currentCount = await this.prisma.bookshelfItem.count({
        where: { bookshelfId: payload.bookshelfId },
      });

      const item = await this.prisma.bookshelfItem.upsert({
        where: {
          bookshelfId_libraryItemId: {
            bookshelfId: payload.bookshelfId,
            libraryItemId: payload.libraryItemId,
          },
        },
        update: {},
        create: {
          bookshelfId: payload.bookshelfId,
          libraryItemId: payload.libraryItemId,
          displayOrder: currentCount,
        },
      });

      return {
        success: true,
        data: {
          id: item.id,
          bookshelfId: item.bookshelfId,
          libraryItemId: item.libraryItemId,
          displayOrder: item.displayOrder,
        },
        message: "Library item added to bookshelf",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to add item to bookshelf",
      };
    }
  }

  async removeFromBookshelf(payload: ModifyBookshelfItemPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      await this.assertBookshelfOwnership(normalizedUserId, payload.bookshelfId);

      await this.prisma.bookshelfItem.deleteMany({
        where: {
          bookshelfId: payload.bookshelfId,
          libraryItemId: payload.libraryItemId,
        },
      });

      return {
        success: true,
        message: "Library item removed from bookshelf",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove item from bookshelf",
      };
    }
  }

  async reorderBookshelf(payload: ReorderBookshelfPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      await this.assertBookshelfOwnership(normalizedUserId, payload.bookshelfId);

      const updates = payload.order.map((libraryItemId, index) =>
        this.prisma.bookshelfItem.updateMany({
          where: {
            bookshelfId: payload.bookshelfId,
            libraryItemId,
          },
          data: { displayOrder: index },
        })
      );

      await this.prisma.$transaction(updates);

      return {
        success: true,
        message: "Bookshelf reordered",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to reorder bookshelf",
      };
    }
  }

  async moveBetweenBookshelves(payload: MoveBookshelfItemPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      await Promise.all([
        this.assertBookshelfOwnership(normalizedUserId, payload.fromBookshelfId),
        this.assertBookshelfOwnership(normalizedUserId, payload.toBookshelfId),
      ]);

      await this.prisma.$transaction([
        this.prisma.bookshelfItem.deleteMany({
          where: {
            bookshelfId: payload.fromBookshelfId,
            libraryItemId: payload.libraryItemId,
          },
        }),
        this.prisma.bookshelfItem.create({
          data: {
            bookshelfId: payload.toBookshelfId,
            libraryItemId: payload.libraryItemId,
            displayOrder: await this.prisma.bookshelfItem.count({
              where: { bookshelfId: payload.toBookshelfId },
            }),
          },
        }),
      ]);

      return {
        success: true,
        message: "Library item moved between bookshelves",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to move item between bookshelves",
      };
    }
  }
}
