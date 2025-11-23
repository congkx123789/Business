import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class BookshelfOrganizationService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async setLayoutPreference(userId: string, layout: "grid" | "list") {
    const normalizedUserId = this.normalizeUserId(userId);
    await this.prisma.readingPreferences.upsert({
      where: { userId: normalizedUserId },
      update: { readingMode: layout === "grid" ? "scroll" : "page" },
      create: {
        userId: normalizedUserId,
        readingMode: layout === "grid" ? "scroll" : "page",
      },
    });

    return {
      success: true,
      message: "Layout preference updated",
    };
  }

  async setSortPreference(userId: string, sort: "recent" | "title" | "progress" | "added") {
    const normalizedUserId = this.normalizeUserId(userId);
    await this.prisma.libraryItem.updateMany({
      where: { userId: normalizedUserId },
      data: { sortOrder: sort.toUpperCase() as any },
    });

    return {
      success: true,
      message: "Sort preference saved",
    };
  }
}

