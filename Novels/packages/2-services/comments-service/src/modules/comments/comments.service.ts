import { Injectable } from "@nestjs/common";
import { ParagraphComment, ChapterComment, Review, ForumPost, ForumThread } from "@prisma/comments-service-client";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

export type CommentEntity =
  | (ParagraphComment & { type: "paragraph" })
  | (ChapterComment & { type: "chapter" })
  | (Review & { type: "review" })
  | (ForumPost & { type: "forum-post" });

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async getCommentById(commentId: string): Promise<{ success: boolean; data?: CommentEntity; message?: string }> {
    const [paragraph, chapter, review, forumPost] = await Promise.all([
      this.prisma.paragraphComment.findUnique({ where: { id: commentId } }),
      this.prisma.chapterComment.findUnique({ where: { id: commentId } }),
      this.prisma.review.findUnique({ where: { id: commentId } }),
      this.prisma.forumPost.findUnique({ where: { id: commentId } }),
    ]);

    const entity: CommentEntity | undefined =
      (paragraph && { ...paragraph, type: "paragraph" as const }) ||
      (chapter && { ...chapter, type: "chapter" as const }) ||
      (review && { ...review, type: "review" as const }) ||
      (forumPost && { ...forumPost, type: "forum-post" as const }) ||
      undefined;

    if (!entity) {
      return { success: false, message: "Comment not found" };
    }

    return {
      success: true,
      data: this.serializeGenericComment(entity),
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const paragraph = await this.prisma.paragraphComment.findUnique({ where: { id: commentId } });
    if (paragraph) {
      if (paragraph.userId !== userId) {
        return { success: false, message: "You cannot delete this comment" };
      }
      await this.prisma.paragraphComment.delete({ where: { id: commentId } });
      await this.commentEvents.commentDeleted({ commentId, type: "paragraph" });
      return { success: true };
    }

    const chapter = await this.prisma.chapterComment.findUnique({ where: { id: commentId } });
    if (chapter) {
      if (chapter.userId !== userId) {
        return { success: false, message: "You cannot delete this comment" };
      }
      await this.prisma.chapterComment.delete({ where: { id: commentId } });
      await this.commentEvents.commentDeleted({ commentId, type: "chapter" });
      return { success: true };
    }

    const review = await this.prisma.review.findUnique({ where: { id: commentId } });
    if (review) {
      if (review.userId !== userId) {
        return { success: false, message: "You cannot delete this review" };
      }
      await this.prisma.review.delete({ where: { id: commentId } });
      await this.commentEvents.commentDeleted({ commentId, type: "review" });
      return { success: true };
    }

    const forumPost = await this.prisma.forumPost.findUnique({ where: { id: commentId } });
    if (forumPost) {
      if (forumPost.userId !== userId) {
        return { success: false, message: "You cannot delete this post" };
      }
      await this.prisma.forumPost.delete({ where: { id: commentId } });
      await this.commentEvents.commentDeleted({ commentId, type: "forum-post" });
      return { success: true };
    }

    return { success: false, message: "Comment not found" };
  }

  async getStoryActivityFeed(storyId: string, limit = 20) {
    const [paragraphs, chapters, reviews, threads] = await Promise.all([
      this.prisma.paragraphComment.findMany({
        where: { storyId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      this.prisma.chapterComment.findMany({
        where: { storyId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      this.prisma.review.findMany({
        where: { storyId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      this.prisma.forumThread.findMany({
        where: { storyId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    const items = [
      ...paragraphs.map((item) =>
        this.buildFeedItem("paragraph", item.createdAt, { paragraph: this.serializeParagraphComment(item) })
      ),
      ...chapters.map((item) =>
        this.buildFeedItem("chapter", item.createdAt, { chapter: this.serializeChapterComment(item) })
      ),
      ...reviews.map((item) =>
        this.buildFeedItem("review", item.createdAt, { review: this.serializeReview(item) })
      ),
      ...threads.map((item) =>
        this.buildFeedItem("forum-thread", item.createdAt, { thread: this.serializeForumThread(item) })
      ),
    ]
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, limit)
      .map(({ sortValue, ...rest }) => rest);

    return {
      success: true,
      storyId,
      items,
    };
  }

  private serializeGenericComment(entity: CommentEntity) {
    switch (entity.type) {
      case "paragraph":
        return {
          type: "paragraph",
          paragraph: this.serializeParagraphComment(entity),
        };
      case "chapter":
        return {
          type: "chapter",
          chapter: this.serializeChapterComment(entity),
        };
      case "review":
        return {
          type: "review",
          review: this.serializeReview(entity),
        };
      case "forum-post":
        return {
          type: "forum-post",
          forumPost: this.serializeForumPost(entity),
        };
      default:
        return { type: "unknown" };
    }
  }

  private serializeParagraphComment(comment: ParagraphComment) {
    return {
      ...comment,
      reactionType: this.mapReactionToEnum(comment.reactionType),
      createdAt: this.toISOString(comment.createdAt),
      updatedAt: this.toISOString(comment.updatedAt),
    };
  }

  private serializeChapterComment(comment: ChapterComment) {
    return {
      ...comment,
      createdAt: this.toISOString(comment.createdAt),
      updatedAt: this.toISOString(comment.updatedAt),
      replies: [],
    };
  }

  private serializeReview(review: Review) {
    return {
      ...review,
      createdAt: this.toISOString(review.createdAt),
      updatedAt: this.toISOString(review.updatedAt),
    };
  }

  private serializeForumPost(post: ForumPost) {
    return {
      ...post,
      createdAt: this.toISOString(post.createdAt),
      updatedAt: this.toISOString(post.updatedAt),
      replies: [],
    };
  }

  private serializeForumThread(thread: ForumThread) {
    return {
      ...thread,
      createdAt: this.toISOString(thread.createdAt),
      updatedAt: this.toISOString(thread.updatedAt),
      lastPostAt: thread.lastPostAt ? this.toISOString(thread.lastPostAt) : null,
    };
  }

  private buildFeedItem<T extends Record<string, unknown>>(type: string, createdAt: Date, payload: T) {
    return {
      type,
      createdAt: this.toISOString(createdAt),
      sortValue: this.toTimestamp(createdAt),
      ...payload,
    };
  }

  private toISOString(value: Date | string | null | undefined) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "string") {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
    }
    return "";
  }

  private toTimestamp(value: Date | string | null | undefined) {
    if (value instanceof Date) {
      return value.getTime();
    }
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
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


