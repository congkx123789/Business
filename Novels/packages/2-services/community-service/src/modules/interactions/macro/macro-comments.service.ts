import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/community-service-client";
import { DatabaseService } from "../../../common/database/database.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateForumPostDto } from "./dto/create-forum-post.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

@Injectable()
export class MacroCommentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async createReview(payload: CreateReviewDto) {
    const review = await this.databaseService.bookReview.create({
      data: {
        storyId: payload.storyId,
        userId: payload.userId,
        rating: payload.rating,
        title: payload.title,
        content: payload.content,
        isSpoiler: payload.isSpoiler ?? false,
      },
    });

    await this.events.reviewCreated({
      reviewId: review.id,
      storyId: review.storyId,
      userId: review.userId,
      rating: review.rating,
    });

    return review;
  }

  async getReviews(options: { storyId: string; page?: number; limit?: number }) {
    const { storyId, page = 1, limit = 20 } = options;
    const where: Prisma.BookReviewWhereInput = { storyId };

    const [data, total] = await Promise.all([
      this.databaseService.bookReview.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.databaseService.bookReview.count({ where }),
    ]);

    return { data, page, limit, total };
  }

  async markReviewHelpful(reviewId: string, userId: string) {
    const review = await this.databaseService.bookReview.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException("Review not found");
    }

    await this.databaseService.$transaction(async (tx) => {
      const existing = await tx.bookReviewHelpful.findUnique({
        where: { reviewId_userId: { reviewId, userId } },
      });
      if (existing) {
        return;
      }

      await tx.bookReviewHelpful.create({
        data: { reviewId, userId },
      });

      await tx.bookReview.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
    });

    return { success: true };
  }

  async createForumPost(payload: CreateForumPostDto) {
    const post = await this.databaseService.forumPost.create({
      data: {
        storyId: payload.storyId ?? null,
        userId: payload.userId,
        title: payload.title,
        content: payload.content,
        category: payload.category,
      },
    });

    await this.events.forumPostCreated({
      postId: post.id,
      storyId: post.storyId,
      userId: post.userId,
      category: post.category,
    });

    return post;
  }

  async getForumPosts(options: { storyId?: string; category?: string; page?: number; limit?: number }) {
    const { storyId, category, page = 1, limit = 20 } = options;
    const where: Prisma.ForumPostWhereInput = {
      ...(storyId ? { storyId } : {}),
      ...(category ? { category } : {}),
    };

    const [data, total] = await Promise.all([
      this.databaseService.forumPost.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.databaseService.forumPost.count({ where }),
    ]);

    return { data, page, limit, total };
  }
}

