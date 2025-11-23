import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { DownloadStatus } from "@prisma/users-service-client";

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async getFastPasses(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const now = new Date();
    const passes = await this.prisma.fastPass.findMany({
      where: {
        userId: normalizedUserId,
        used: false,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        expiresAt: "asc",
      },
    });

    return passes.map((pass) => ({
      id: pass.id,
      storyId: pass.storyId ?? undefined,
      chapterId: pass.chapterId ?? undefined,
      expiresAt: pass.expiresAt.toISOString(),
    }));
  }
}

