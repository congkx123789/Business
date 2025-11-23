import { Injectable, Logger } from "@nestjs/common";
import { AppGateway } from "./app.gateway";

interface BaseStoryPayload {
  storyId?: string;
  bookId?: string;
}

interface CommentPayload extends BaseStoryPayload {
  id: string;
  userId?: string;
  content?: string;
  chapterId?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
}

@Injectable()
export class CommentsGateway {
  private readonly logger = new Logger(CommentsGateway.name);

  constructor(private readonly appGateway: AppGateway) {}

  emitCommentCreated(payload: CommentPayload) {
    const room = this.buildStoryRoom(payload);
    if (!room) {
      return;
    }

    this.logger.debug(`Emitting comment:created to ${room} (${payload.id})`);
    this.appGateway.emitToRoom(room, "comment:created", {
      id: payload.id,
      storyId: payload.storyId ?? payload.bookId,
      chapterId: payload.chapterId,
      userId: payload.userId,
      content: payload.content,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitCommentUpdated(payload: CommentPayload) {
    const room = this.buildStoryRoom(payload);
    if (!room) {
      return;
    }

    this.logger.debug(`Emitting comment:updated to ${room} (${payload.id})`);
    this.appGateway.emitToRoom(room, "comment:updated", {
      id: payload.id,
      storyId: payload.storyId ?? payload.bookId,
      chapterId: payload.chapterId,
      userId: payload.userId,
      content: payload.content,
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    });
  }

  emitCommentDeleted(payload: Pick<CommentPayload, "id"> & BaseStoryPayload) {
    const room = this.buildStoryRoom(payload);
    if (!room) {
      return;
    }

    this.logger.debug(`Emitting comment:deleted to ${room} (${payload.id})`);
    this.appGateway.emitToRoom(room, "comment:deleted", {
      id: payload.id,
      storyId: payload.storyId ?? payload.bookId,
    });
  }

  emitCommentReplied(payload: CommentPayload & { parentId?: string }) {
    const room = this.buildStoryRoom(payload);
    if (!room) {
      return;
    }

    this.logger.debug(`Emitting comment:replied to ${room} (${payload.id})`);
    this.appGateway.emitToRoom(room, "comment:replied", {
      id: payload.id,
      parentId: payload.parentId,
      storyId: payload.storyId ?? payload.bookId,
      chapterId: payload.chapterId,
      userId: payload.userId,
      content: payload.content,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  private buildStoryRoom(payload: BaseStoryPayload) {
    const storyId = payload.storyId ?? payload.bookId;
    return storyId ? `story:${storyId}` : undefined;
  }
}


