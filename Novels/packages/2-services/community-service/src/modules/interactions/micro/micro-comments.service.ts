import { ParagraphReaction, Prisma } from "@prisma/community-service-client";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../../common/database/database.service";
import { CreateParagraphCommentDto } from "./dto/create-paragraph-comment.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

@Injectable()
export class MicroCommentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async createParagraphComment(payload: CreateParagraphCommentDto) {
    const comment = await this.databaseService.paragraphComment.create({
      data: {
        storyId: payload.storyId,
        chapterId: payload.chapterId,
        paragraphIndex: payload.paragraphIndex,
        paragraphText: payload.paragraphText,
        userId: payload.userId,
        authorId: payload.authorId ?? null,
        content: payload.content,
        reactionType: payload.reactionType
          ? (payload.reactionType.toUpperCase() as ParagraphReaction)
          : null,
      },
      include: {
        likes: true,
        replies: true,
      },
    });

    await this.events.paragraphCommentCreated({
      commentId: comment.id,
      storyId: comment.storyId,
      chapterId: comment.chapterId,
      paragraphIndex: comment.paragraphIndex,
      userId: comment.userId,
    });

    await this.events.paragraphCommentCountUpdated({
      chapterId: comment.chapterId,
      paragraphIndex: comment.paragraphIndex,
    });

    return comment;
  }

  async getParagraphComments(options: {
    chapterId: string;
    paragraphIndex?: number;
    page?: number;
    limit?: number;
  }) {
    const { chapterId, paragraphIndex, page = 1, limit = 20 } = options;
    const where: Prisma.ParagraphCommentWhereInput = {
      chapterId,
      ...(typeof paragraphIndex === "number" ? { paragraphIndex } : {}),
    };

    const [data, total] = await this.databaseService.$transaction([
      this.databaseService.paragraphComment.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          replies: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      this.databaseService.paragraphComment.count({ where }),
    ]);

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async likeParagraphComment(commentId: string, userId: string, isAuthor = false) {
    await this.databaseService.$transaction(async (tx) => {
      const existing = await tx.paragraphCommentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      if (existing) {
        return;
      }

      await tx.paragraphCommentLike.create({
        data: {
          commentId,
          userId,
          isAuthor,
        },
      });

      await tx.paragraphComment.update({
        where: { id: commentId },
        data: {
          likeCount: { increment: 1 },
          isAuthorLiked: isAuthor ? true : undefined,
        },
      });
    });

    await this.events.paragraphCommentLiked({
      commentId,
      userId,
      isAuthor,
    });

    return { success: true };
  }

  async replyToParagraphComment(payload: { parentCommentId: string; userId: string; content: string; isAuthorReply?: boolean }) {
    const reply = await this.databaseService.paragraphCommentReply.create({
      data: {
        commentId: payload.parentCommentId,
        userId: payload.userId,
        content: payload.content,
        isAuthorReply: payload.isAuthorReply ?? false,
      },
    });

    await this.databaseService.paragraphComment.update({
      where: { id: payload.parentCommentId },
      data: {
        replyCount: { increment: 1 },
        isAuthorReplied: reply.isAuthorReply ? true : undefined,
      },
    });

    await this.events.paragraphCommentReplied({
      commentId: payload.parentCommentId,
      replyId: reply.id,
      userId: payload.userId,
      isAuthorReply: payload.isAuthorReply ?? false,
    });

    return reply;
  }

  async getParagraphCommentCounts(chapterId: string) {
    const counts = await this.databaseService.paragraphComment.groupBy({
      by: ["paragraphIndex"],
      where: { chapterId },
      _count: { _all: true },
    });

    return counts.map((group) => ({
      chapterId,
      paragraphIndex: group.paragraphIndex,
      count: group._count._all,
    }));
  }

  async deleteParagraphComment(commentId: string, userId: string) {
    const comment = await this.databaseService.paragraphComment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException("Paragraph comment not found");
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException("Cannot delete another user's comment");
    }

    const deletedComment = await this.databaseService.paragraphComment.delete({ where: { id: commentId } });
    
    await this.events.commentDeleted({ commentId, type: "paragraph" });
    
    await this.events.paragraphCommentCountUpdated({
      chapterId: deletedComment.chapterId,
      paragraphIndex: deletedComment.paragraphIndex,
    });
    
    return { success: true };
  }

  async getParagraphCommentCount(chapterId: string, paragraphIndex?: number) {
    if (typeof paragraphIndex === "number") {
      const count = await this.databaseService.paragraphComment.count({
        where: { chapterId, paragraphIndex },
      });
      return { chapterId, paragraphIndex, count };
    }

    return this.getParagraphCommentCounts(chapterId);
  }
}

