import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { Prisma } from "@prisma/users-service-client";

@Injectable()
export class LayoutPreferencesService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async updateLayoutPreferences(userId: string, layout: Prisma.InputJsonValue) {
    const normalizedUserId = this.normalizeUserId(userId);
    await this.prisma.desktopPreferences.upsert({
      where: { userId: normalizedUserId },
      update: { layoutPreferences: layout },
      create: {
        userId: normalizedUserId,
        layoutPreferences: layout,
      },
    });
  }
}

