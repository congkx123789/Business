import { Injectable } from "@nestjs/common";
import {
  CreateParagraphCommentDto,
  DeleteParagraphCommentDto,
  GetParagraphCommentsDto,
  LikeParagraphCommentDto,
  ReplyToParagraphCommentDto,
} from "7-shared/validation/comment";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

type SortBy = "newest" | "oldest" | "most-liked";

@Injectable()
export class ParagraphCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async create(payload: CreateParagraphCommentDto & { userId: string }) {
    const comment = await this.prisma.paragraphComment.create({
      data: {
        storyId: payload.storyId,
        chapterId: payload.chapterId,
        userId: payload.userId,
        paragraphIndex: payload.paragraphIndex,
        paragraphText: payload.paragraphText,
        content: payload.content,
        reactionType: payload.reactionType ?? null,
      },
    });

    await this.commentEvents.paragraphCommentCreated({
      commentId: comment.id,
      storyId: comment.storyId,
      chapterId: comment.chapterId,
      paragraphIndex: comment.paragraphIndex,
      userId: comment.userId,
    });

    return {
      success: true,
      data: this.serializeComment(comment),
    };
  }

  async list(params: GetParagraphCommentsDto & { includeReplies?: boolean; offset?: number }) {
    const { chapterId, paragraphIndex, limit, offset, sortBy = "newest" } = params;

    const orderBy = this.toOrderBy(sortBy);
    const safeLimit = limit && limit > 0 ? limit : 20;
    const safeOffset = offset && offset > 0 ? offset : 0;
    const where = {
      chapterId,
      ...(typeof paragraphIndex === "number" ? { paragraphIndex } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.paragraphComment.findMany({
        where,
        orderBy,
        skip: safeOffset,
        take: safeLimit,
        include: {
          replies: params.includeReplies
            ? {
                orderBy: { createdAt: "asc" },
                take: 20,
              }
            : false,
        },
      }),
      this.prisma.paragraphComment.count({ where }),
    ]);

    return {
      success: true,
      data: data.map((comment) => this.serializeComment(comment, params.includeReplies)),
      total,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
      },
    };
  }

  async delete(params: DeleteParagraphCommentDto & { userId: string }) {
    const comment = await this.prisma.paragraphComment.findUnique({
      where: { id: params.commentId },
    });

    if (!comment) {
      return { success: false, message: "Comment not found" };
    }

    if (comment.userId !== params.userId) {
      return { success: false, message: "You cannot delete this comment" };
    }

    await this.prisma.paragraphComment.delete({ where: { id: comment.id } });
    await this.commentEvents.commentDeleted({
      commentId: comment.id,
      storyId: comment.storyId,
      chapterId: comment.chapterId,
      type: "paragraph",
    });

    return { success: true };
  }

  async toggleLike(params: LikeParagraphCommentDto & { userId: string; isAuthor?: boolean }) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.paragraphCommentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: params.commentId,
            userId: params.userId,
          },
        },
      });

      if (existing) {
        await tx.paragraphCommentLike.delete({
          where: { id: existing.id },
        });

        await tx.paragraphComment.update({
          where: { id: params.commentId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });

        return { liked: false };
      }

      await tx.paragraphCommentLike.create({
        data: {
          commentId: params.commentId,
          userId: params.userId,
          isAuthor: params.isAuthor ?? false,
        },
      });

      await tx.paragraphComment.update({
        where: { id: params.commentId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return { liked: true };
    });

    await this.commentEvents.paragraphCommentLiked({
      commentId: params.commentId,
      userId: params.userId,
      liked: result.liked,
    });

    return {
      success: true,
      ...result,
    };
  }

  async reply(params: ReplyToParagraphCommentDto & { userId: string; isAuthorReply?: boolean }) {
    const reply = await this.prisma.$transaction(async (tx) => {
      const created = await tx.paragraphCommentReply.create({
        data: {
          commentId: params.commentId,
          userId: params.userId,
          content: params.content,
          isAuthorReply: params.isAuthorReply ?? false,
        },
      });

      await tx.paragraphComment.update({
        where: { id: params.commentId },
        data: {
          replyCount: {
            increment: 1,
          },
        },
      });

      return created;
    });

    await this.commentEvents.paragraphCommentReplied({
      commentId: reply.commentId,
      replyId: reply.id,
      userId: reply.userId,
    });

    return {
      success: true,
      data: this.serializeReply(reply),
    };
  }

  async countByChapter(chapterId: string) {
    const counts = await this.prisma.paragraphComment.groupBy({
      by: ["paragraphIndex"],
      where: { chapterId },
      _count: {
        _all: true,
      },
      orderBy: {
        paragraphIndex: "asc",
      },
    });

    return {
      success: true,
      chapterId,
      counts: counts.map((entry) => ({
        paragraphIndex: entry.paragraphIndex,
        count: entry._count._all,
      })),
    };
  }

  private toOrderBy(sortBy: SortBy) {
    switch (sortBy) {
      case "oldest":
        return { createdAt: "asc" as const };
      case "most-liked":
        return { likeCount: "desc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  }
  private serializeComment(comment: any, includeReplies?: boolean) {
    return {
      ...comment,
      reactionType: this.mapReactionToEnum(comment.reactionType),
      createdAt: this.toISOString(comment.createdAt),
      updatedAt: this.toISOString(comment.updatedAt),
      replies: includeReplies && Array.isArray(comment.replies)
        ? comment.replies.map((reply: any) => this.serializeReply(reply))
        : comment.replies,
    };
  }

  private serializeReply(reply: any) {
    return {
      ...reply,
      createdAt: this.toISOString(reply?.createdAt),
      updatedAt: this.toISOString(reply?.updatedAt),
    };
  }

  private toISOString(value: unknown) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "string") {
      return value;
    }
    return "";
  }

  private mapReactionToEnum(reaction?: string | null) {
    switch (reaction) {
      case "like":
        return 1;
      case "laugh":
        return 2;
      case "cry":
        return 3;
      case "angry":
        return 4;
      case "wow":
        return 5;
      case "love":
        return 6;
      default:
        return 0;
    }
  }
}


