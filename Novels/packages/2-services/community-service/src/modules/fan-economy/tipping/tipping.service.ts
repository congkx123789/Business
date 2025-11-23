import { Injectable } from "@nestjs/common";
import { Prisma, Tip } from "@prisma/community-service-client";
import { DatabaseService } from "../../../common/database/database.service";
import { CreateTipDto } from "./dto/create-tip.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

const LARGE_TIP_THRESHOLD = new Prisma.Decimal(5000);

@Injectable()
export class TippingService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async createTip(payload: CreateTipDto) {
    const amount = new Prisma.Decimal(payload.amount);
    const platformShare = amount.mul(0.5);
    const taxShare = amount.mul(0.06);
    const authorShare = amount.sub(platformShare).sub(taxShare);
    const isLargeTip = amount.greaterThanOrEqualTo(LARGE_TIP_THRESHOLD);

    const tip = await this.databaseService.tip.create({
      data: {
        storyId: payload.storyId,
        authorId: payload.authorId,
        userId: payload.userId,
        amount,
        message: payload.message ?? null,
        platformShare,
        taxShare,
        authorShare,
        isLargeTip,
      },
    });

    const mapped = this.mapTip(tip);
    await this.events.tipCreated(mapped);
    if (mapped.isLargeTip) {
      await this.events.tipLarge(mapped);
    }
    return mapped;
  }

  async getTipHistory(options: { storyId: string; authorId?: string; userId?: string; page?: number; limit?: number }) {
    const { storyId, authorId, userId, page = 1, limit = 20 } = options;
    const where: Prisma.TipWhereInput = {
      storyId,
      ...(authorId ? { authorId } : {}),
      ...(userId ? { userId } : {}),
    };

    const [data, total] = await Promise.all([
      this.databaseService.tip.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.databaseService.tip.count({ where }),
    ]);

    return { data: data.map((tip) => this.mapTip(tip)), page, limit, total };
  }

  async getTotalTips(options: { storyId?: string; authorId?: string }) {
    const where: Prisma.TipWhereInput = {
      ...(options.storyId ? { storyId: options.storyId } : {}),
      ...(options.authorId ? { authorId: options.authorId } : {}),
    };

    const aggregate = await this.databaseService.tip.aggregate({
      where,
      _sum: { amount: true },
    });

    return { totalAmount: aggregate._sum.amount?.toNumber() ?? 0 };
  }

  private mapTip(tip: Tip) {
    return {
      id: tip.id,
      storyId: tip.storyId,
      authorId: tip.authorId,
      userId: tip.userId,
      amount: new Prisma.Decimal(tip.amount).toNumber(),
      message: tip.message ?? undefined,
      platformShare: new Prisma.Decimal(tip.platformShare).toNumber(),
      taxShare: new Prisma.Decimal(tip.taxShare).toNumber(),
      authorShare: new Prisma.Decimal(tip.authorShare).toNumber(),
      isLargeTip: tip.isLargeTip ?? false,
      createdAt: tip.createdAt,
    };
  }
}

