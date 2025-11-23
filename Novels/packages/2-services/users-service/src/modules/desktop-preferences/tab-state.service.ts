import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { Prisma } from "@prisma/users-service-client";

@Injectable()
export class TabStateService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async updateTabState(userId: string, tabState: Prisma.InputJsonValue) {
    const normalizedUserId = this.normalizeUserId(userId);
    await this.prisma.desktopPreferences.upsert({
      where: { userId: normalizedUserId },
      update: { tabState },
      create: {
        userId: normalizedUserId,
        tabState,
      },
    });
  }
}

