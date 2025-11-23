import { Injectable, Logger } from "@nestjs/common";
import { AppGateway } from "./app.gateway";

interface SocialPayload {
  id: string;
  userId: string;
  content?: string;
  groupId?: string;
  createdAt?: string | number;
  likedBy?: string;
}

interface FollowPayload {
  followerId: string;
  followingId: string;
  timestamp?: string | number;
}

@Injectable()
export class SocialGateway {
  private readonly logger = new Logger(SocialGateway.name);

  constructor(private readonly appGateway: AppGateway) {}

  emitFeedUpdate(payload: SocialPayload) {
    const room = this.buildUserRoom(payload.userId);
    this.logger.debug(`Emitting post:created to ${room}`);
    this.appGateway.emitToRoom(room, "post:created", {
      id: payload.id,
      userId: payload.userId,
      content: payload.content,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitGroupPost(payload: SocialPayload) {
    if (!payload.groupId) {
      return;
    }
    const room = this.buildGroupRoom(payload.groupId);
    this.logger.debug(`Emitting group post to ${room}`);
    this.appGateway.emitToRoom(room, "group:post.created", {
      id: payload.id,
      groupId: payload.groupId,
      userId: payload.userId,
      content: payload.content,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitPostLiked(payload: SocialPayload) {
    const room = this.buildUserRoom(payload.userId);
    this.logger.debug(`Emitting post:liked to ${room}`);
    this.appGateway.emitToRoom(room, "post:liked", {
      id: payload.id,
      likedBy: payload.likedBy,
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  emitFollowerUpdate(payload: FollowPayload) {
    const room = this.buildUserRoom(payload.followingId);
    this.logger.debug(`Emitting user:followed to ${room}`);
    this.appGateway.emitToRoom(room, "user:followed", {
      followerId: payload.followerId,
      followingId: payload.followingId,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    });
  }

  private buildUserRoom(userId?: string) {
    return userId ? `user:${userId}` : undefined;
  }

  private buildGroupRoom(groupId?: string) {
    return groupId ? `group:${groupId}` : undefined;
  }
}


