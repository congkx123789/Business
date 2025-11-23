import { Injectable, Logger } from "@nestjs/common";
import { AppGateway } from "./app.gateway";

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  createdAt?: string | number;
}

@Injectable()
export class NotificationsGateway {
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly appGateway: AppGateway) {}

  emitNotification(payload: NotificationPayload) {
    const room = this.buildUserRoom(payload.userId);
    this.logger.debug(`Emitting notification:created to ${room}`);
    this.appGateway.emitToRoom(room, "notification:created", {
      type: payload.type,
      title: payload.title,
      body: payload.body,
      metadata: payload.metadata ?? {},
      createdAt: payload.createdAt ?? new Date().toISOString(),
    });
  }

  private buildUserRoom(userId?: string) {
    return userId ? `user:${userId}` : undefined;
  }
}


