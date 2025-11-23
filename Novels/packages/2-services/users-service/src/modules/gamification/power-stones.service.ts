import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

const POWER_STONE_DAILY_AMOUNT = 2;

@Injectable()
export class PowerStonesService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private getDayRange(reference = new Date()) {
    const start = new Date(reference);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  async getPowerStones(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const { start, end } = this.getDayRange();
    let record = await this.prisma.powerStone.findFirst({
      where: {
        userId: normalizedUserId,
        date: {
          gte: start,
          lt: end,
        },
      },
    });

    if (!record) {
      record = await this.prisma.powerStone.create({
        data: {
          userId: normalizedUserId,
          amount: POWER_STONE_DAILY_AMOUNT,
          date: start,
          resetAt: end,
        },
      });
    }

    return {
      count: record.amount,
      resetAt: record.resetAt.toISOString(),
    };
  }
}

