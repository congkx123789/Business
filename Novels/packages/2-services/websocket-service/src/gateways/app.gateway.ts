import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Injectable, Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@NestWebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/",
})
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(client: Socket, room: string) {
    if (!room) {
      return;
    }
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage("leave-room")
  handleLeaveRoom(client: Socket, room: string) {
    if (!room) {
      return;
    }
    client.leave(room);
    this.logger.debug(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage("subscribe")
  handleSubscribe(client: Socket, room: string) {
    this.handleJoinRoom(client, room);
  }

  @SubscribeMessage("unsubscribe")
  handleUnsubscribe(client: Socket, room: string) {
    this.handleLeaveRoom(client, room);
  }

  emitToRoom(room: string | undefined | null, event: string, payload: unknown) {
    if (!room || !this.server) {
      return;
    }
    this.server.to(room).emit(event, payload);
  }

  emitToRooms(rooms: Array<string | undefined | null>, event: string, payload: unknown) {
    rooms.filter(Boolean).forEach((room) => this.emitToRoom(room, event, payload));
  }

  emitToAll(event: string, payload: unknown) {
    if (!this.server) {
      return;
    }
    this.server.emit(event, payload);
  }
}
