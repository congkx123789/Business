import { Controller, Logger } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AppGateway } from "../gateways/app.gateway";

interface BroadcastEventRequest {
  event: string;
  payload?: Record<string, any>;
  room?: string;
  rooms?: string[];
  userId?: string;
  storyId?: string;
  chapterId?: string;
  groupId?: string;
  walletUserId?: string;
  broadcastAll?: boolean;
}

interface BroadcastResponse {
  success: boolean;
  message?: string;
}

@Controller()
export class WebsocketController {
  private readonly logger = new Logger(WebsocketController.name);

  constructor(private readonly appGateway: AppGateway) {}

  @GrpcMethod("WebsocketService", "BroadcastEvent")
  handleBroadcast(request: BroadcastEventRequest): BroadcastResponse {
    if (!request?.event) {
      return {
        success: false,
        message: "Event name is required",
      };
    }

    const payload = request.payload ?? {};

    if (request.broadcastAll) {
      this.logger.debug(`Broadcasting "${request.event}" to all clients`);
      this.appGateway.emitToAll(request.event, payload);
      return {
        success: true,
        message: "Broadcasted to all clients",
      };
    }

    const rooms = this.resolveRooms(request);
    if (!rooms.length) {
      return {
        success: false,
        message: "At least one room or target identifier is required",
      };
    }

    rooms.forEach((room) => this.appGateway.emitToRoom(room, request.event, payload));
    this.logger.debug(`Broadcasted "${request.event}" to rooms: ${rooms.join(", ")}`);

    return {
      success: true,
      message: `Broadcasted to ${rooms.length} room(s)`,
    };
  }

  private resolveRooms(request: BroadcastEventRequest) {
    const rooms = new Set<string>();

    if (request.room) {
      rooms.add(request.room);
    }

    request.rooms?.forEach((room) => {
      if (room) {
        rooms.add(room);
      }
    });

    if (request.userId) {
      rooms.add(`user:${request.userId}`);
    }

    if (request.storyId) {
      rooms.add(`story:${request.storyId}`);
    }

    if (request.chapterId) {
      rooms.add(`chapter:${request.chapterId}`);
    }

    if (request.groupId) {
      rooms.add(`group:${request.groupId}`);
    }

    if (request.walletUserId) {
      rooms.add(`wallet:${request.walletUserId}`);
    }

    return Array.from(rooms);
  }
}


