import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

interface CreateReviewInput {
  storyId: string;
  userId: string;
  title?: string;
  content: string;
  plotRating?: number;
  characterRating?: number;
  writingStyleRating?: number;
  overallRating: number;
}

interface UpdateReviewInput extends Partial<CreateReviewInput> {
  id: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async getStoryReviews(storyId: string, limit = 20, offset = 0) {
    const safeLimit = limit && limit > 0 ? limit : 20;
    const safeOffset = offset && offset > 0 ? offset : 0;
    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { storyId },
        orderBy: { createdAt: "desc" },
        skip: safeOffset,
        take: safeLimit,
      }),
      this.prisma.review.count({ where: { storyId } }),
    ]);

    const average =
      total === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.overallRating, 0) / total;

    return {
      success: true,
      data: reviews,
      total,
      averageRating: Number(average.toFixed(2)),
    };
  }

  async createReview(input: CreateReviewInput) {
    const previous = await this.prisma.review.findUnique({
      where: {
        storyId_userId: {
          storyId: input.storyId,
          userId: input.userId,
        },
      },
    });

    const review = await this.prisma.review.upsert({
      where: {
        storyId_userId: {
          storyId: input.storyId,
          userId: input.userId,
        },
      },
      create: input,
      update: {
        title: input.title,
        content: input.content,
        plotRating: input.plotRating,
        characterRating: input.characterRating,
        writingStyleRating: input.writingStyleRating,
        overallRating: input.overallRating,
      },
    });

    if (!previous) {
      await this.commentEvents.reviewCreated({
        reviewId: review.id,
        storyId: review.storyId,
        userId: review.userId,
        overallRating: review.overallRating,
      });
    }

    return {
      success: true,
      data: review,
    };
  }

  async updateReview(payload: UpdateReviewInput, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: payload.id } });
    if (!review) {
      return { success: false, message: "Review not found" };
    }
    if (review.userId !== userId) {
      return { success: false, message: "You cannot edit this review" };
    }

    const updated = await this.prisma.review.update({
      where: { id: payload.id },
      data: {
        title: payload.title ?? review.title,
        content: payload.content ?? review.content,
        plotRating: payload.plotRating ?? review.plotRating,
        characterRating: payload.characterRating ?? review.characterRating,
        writingStyleRating: payload.writingStyleRating ?? review.writingStyleRating,
        overallRating: payload.overallRating ?? review.overallRating,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async deleteReview(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      return { success: false, message: "Review not found" };
    }
    if (review.userId !== userId) {
      return { success: false, message: "You cannot delete this review" };
    }

    await this.prisma.review.delete({ where: { id } });
    await this.commentEvents.commentDeleted({
      commentId: review.id,
      storyId: review.storyId,
      type: "review",
    });
    return { success: true };
  }

  async markHelpful(reviewId: string, userId: string) {
    const vote = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.reviewHelpfulVote.findUnique({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
      });

      if (existing) {
        await tx.reviewHelpfulVote.delete({ where: { id: existing.id } });
        await tx.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { decrement: 1 } },
        });
        return { helpful: false };
      }

      await tx.reviewHelpfulVote.create({
        data: {
          reviewId,
          userId,
        },
      });
      await tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
      return { helpful: true };
    });

    return {
      success: true,
      ...vote,
    };
  }
}


