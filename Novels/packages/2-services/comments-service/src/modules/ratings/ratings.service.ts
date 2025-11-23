import { Injectable } from "@nestjs/common";
import { CreateRatingDto } from "7-shared/validation/comment";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

@Injectable()
export class RatingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async createOrUpdateRating(payload: CreateRatingDto & { userId: string }) {
    const rating = await this.prisma.rating.upsert({
      where: {
        storyId_userId: {
          storyId: payload.storyId,
          userId: payload.userId,
        },
      },
      create: {
        storyId: payload.storyId,
        userId: payload.userId,
        rating: payload.rating,
        review: payload.review ?? null,
      },
      update: {
        rating: payload.rating,
        review: payload.review ?? null,
      },
    });

    await this.commentEvents.ratingUpdated({
      ratingId: rating.id,
      storyId: rating.storyId,
      userId: rating.userId,
      rating: rating.rating,
    });

    return {
      success: true,
      data: rating,
    };
  }

  async getRatingSummary(storyId: string) {
    const [count, sum] = await Promise.all([
      this.prisma.rating.count({ where: { storyId } }),
      this.prisma.rating.aggregate({
        where: { storyId },
        _sum: { rating: true },
      }),
    ]);

    return {
      success: true,
      storyId,
      count,
      average: count === 0 ? 0 : Number(((sum._sum.rating ?? 0) / count).toFixed(2)),
    };
  }
}


