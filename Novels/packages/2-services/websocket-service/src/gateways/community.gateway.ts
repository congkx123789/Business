import { Injectable, Logger } from "@nestjs/common";
import { AppGateway } from "./app.gateway";

interface ParagraphCommentPayload {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  storyId?: string;
  bookId?: string;
  userId?: string;
  content?: string;
  reactions?: Record<string, number>;
  createdAt?: string | number;
}

interface LikePayload {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  totalLikes: number;
}

interface ParagraphCountPayload {
  chapterId: string;
  paragraphIndex: number;
  totalCount: number;
}

interface ChapterCommentPayload {
  id: string;
  chapterId: string;
  storyId?: string;
  bookId?: string;
  userId?: string;
  content?: string;
  createdAt?: string | number;
}

interface TipPayload {
  id: string;
  userId: string;
  authorId: string;
  amount: number;
  storyId?: string;
  createdAt?: string | number;
}

interface VotePayload {
  userId: string;
  storyId: string;
  votes: number;
  month?: number;
  year?: number;
}

interface FanRankingPayload {
  storyId: string;
  rankings: Array<{
    userId: string;
    username?: string;
    power?: number;
  }>;
  updatedAt?: string | number;
}

@Injectable()
export class CommunityGateway {
  private readonly logger = new Logger(CommunityGateway.name);

  constructor(private readonly appGateway: AppGateway) {}

  emitParagraphComment(payload: ParagraphCommentPayload) {
    const rooms = [
      this.buildChapterRoom(payload.chapterId),
      this.buildStoryRoom(payload.storyId ?? payload.bookId),
    ].filter(Boolean) as string[];
    this.logger.debug(`Emitting paragraph.comment.created to ${rooms.join(",") || "none"}`);
    this.appGateway.emitToRooms(rooms, "paragraph.comment.created", {
      id: payload.id,
      chapterId: payload.chapterId,
      paragraphIndex: payload.paragraphIndex,
      storyId: payload.storyId ?? payload.bookId,
      userId: payload.userId,
      content: payload.content,
      reactions: payload.reactions ?? {},
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitParagraphLike(payload: LikePayload) {
    const room = this.buildChapterRoom(payload.chapterId);
    this.logger.debug(`Emitting paragraph.comment.liked to ${room}`);
    this.appGateway.emitToRoom(room, "paragraph.comment.liked", {
      id: payload.id,
      chapterId: payload.chapterId,
      paragraphIndex: payload.paragraphIndex,
      totalLikes: payload.totalLikes,
    });
  }

  emitParagraphCountUpdate(payload: ParagraphCountPayload) {
    const room = this.buildChapterRoom(payload.chapterId);
    this.logger.debug(`Emitting paragraph.comment.count.updated to ${room}`);
    this.appGateway.emitToRoom(room, "paragraph.comment.count.updated", {
      chapterId: payload.chapterId,
      paragraphIndex: payload.paragraphIndex,
      totalCount: payload.totalCount,
    });
  }

  emitChapterComment(payload: ChapterCommentPayload) {
    const rooms = [
      this.buildChapterRoom(payload.chapterId),
      this.buildStoryRoom(payload.storyId ?? payload.bookId),
    ].filter(Boolean) as string[];
    this.logger.debug(`Emitting chapter.comment.created to ${rooms.join(",") || "none"}`);
    this.appGateway.emitToRooms(rooms, "chapter.comment.created", {
      id: payload.id,
      chapterId: payload.chapterId,
      storyId: payload.storyId ?? payload.bookId,
      userId: payload.userId,
      content: payload.content,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitTip(payload: TipPayload) {
    const rooms = [
      this.buildStoryRoom(payload.storyId),
      this.buildUserRoom(payload.userId),
      this.buildUserRoom(payload.authorId),
    ].filter(Boolean) as string[];
    if (!rooms.length) {
      return;
    }

    this.logger.debug(`Emitting tip.created to ${rooms.join(",")}`);
    this.appGateway.emitToRooms(rooms, "tip.created", {
      id: payload.id,
      userId: payload.userId,
      authorId: payload.authorId,
      amount: payload.amount,
      storyId: payload.storyId,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitMonthlyVote(payload: VotePayload) {
    const room = this.buildStoryRoom(payload.storyId);
    this.logger.debug(`Emitting monthly.vote.cast to ${room}`);
    this.appGateway.emitToRoom(room, "monthly.vote.cast", {
      userId: payload.userId,
      storyId: payload.storyId,
      votes: payload.votes,
      month: payload.month,
      year: payload.year,
    });
  }

  emitFanRankingUpdate(payload: FanRankingPayload) {
    const room = this.buildStoryRoom(payload.storyId);
    this.logger.debug(`Emitting fan.ranking.updated to ${room}`);
    this.appGateway.emitToRoom(room, "fan.ranking.updated", {
      storyId: payload.storyId,
      rankings: payload.rankings,
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    });
  }

  private buildChapterRoom(chapterId?: string) {
    return chapterId ? `chapter:${chapterId}` : undefined;
  }

  private buildStoryRoom(storyId?: string) {
    return storyId ? `story:${storyId}` : undefined;
  }

  private buildUserRoom(userId?: string) {
    return userId ? `user:${userId}` : undefined;
  }
}


