import { Injectable } from "@nestjs/common";
import { CreateChapterCommentDto } from "7-shared/validation/comment";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

interface GetChapterCommentsOptions {
  chapterId: string;
  limit?: number;
  offset?: number;
  sortBy?: "newest" | "oldest" | "top";
}

@Injectable()
export class ChapterCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async create(payload: CreateChapterCommentDto & { storyId: string; userId: string }) {
    const comment = await this.prisma.chapterComment.create({
      data: {
        chapterId: payload.chapterId,
        storyId: payload.storyId,
        userId: payload.userId,
        content: payload.content,
        parentId: payload.parentId ?? null,
      },
    });

    await this.commentEvents.chapterCommentCreated({
      commentId: comment.id,
      storyId: comment.storyId,
      chapterId: comment.chapterId,
      userId: comment.userId,
      parentId: comment.parentId,
    });

    return {
      success: true,
      data: comment,
    };
  }

  async list(options: GetChapterCommentsOptions) {
    const { chapterId, limit, offset, sortBy = "newest" } = options;
    const safeLimit = limit && limit > 0 ? limit : 20;
    const safeOffset = offset && offset > 0 ? offset : 0;
    const orderBy = this.toOrderBy(sortBy);

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.chapterComment.findMany({
        where: {
          chapterId,
          parentId: null,
        },
        orderBy,
        skip: safeOffset,
        take: safeLimit,
        include: {
          replies: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      this.prisma.chapterComment.count({
        where: {
          chapterId,
          parentId: null,
        },
      }),
    ]);

    return {
      success: true,
      data: comments,
      total,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
      },
    };
  }

  async vote(commentId: string, userId: string, value: 1 | -1) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.chapterCommentVote.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      if (existing && existing.value === value) {
        await tx.chapterCommentVote.delete({ where: { id: existing.id } });
        await tx.chapterComment.update({
          where: { id: commentId },
          data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
        });
        return { value: 0 };
      }

      if (existing) {
        await tx.chapterCommentVote.update({
          where: { id: existing.id },
          data: { value },
        });
      } else {
        await tx.chapterCommentVote.create({
          data: {
            commentId,
            userId,
            value,
          },
        });
      }

      await tx.chapterComment.update({
        where: { id: commentId },
        data:
          value === 1
            ? {
                upvotes: { increment: 1 },
                ...(existing?.value === -1 ? { downvotes: { decrement: 1 } } : {}),
              }
            : {
                downvotes: { increment: 1 },
                ...(existing?.value === 1 ? { upvotes: { decrement: 1 } } : {}),
              },
      });

      return { value };
    });

    return {
      success: true,
      ...result,
    };
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.chapterComment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return { success: false, message: "Comment not found" };
    }
    if (comment.userId !== userId) {
      return { success: false, message: "You cannot delete this comment" };
    }

    await this.prisma.chapterComment.delete({ where: { id: comment.id } });
    await this.commentEvents.commentDeleted({
      commentId: comment.id,
      storyId: comment.storyId,
      chapterId: comment.chapterId,
      type: "chapter",
    });
    return { success: true };
  }

  private toOrderBy(sortBy: "newest" | "oldest" | "top") {
    switch (sortBy) {
      case "oldest":
        return { createdAt: "asc" as const };
      case "top":
        return { upvotes: "desc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  }
}


