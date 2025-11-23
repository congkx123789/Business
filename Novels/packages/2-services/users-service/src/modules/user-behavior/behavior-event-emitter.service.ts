import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/users-service-client";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class BehaviorEventEmitterService {
  constructor(private readonly prisma: DatabaseService) {}

  async emitEvent(event: { type: string; payload: Record<string, unknown> }) {
    await this.prisma.userBehaviorEvent.create({
      data: {
        userId: Number(event.payload.userId ?? 0),
        action: event.type,
        metadata: event.payload as Prisma.InputJsonValue,
      },
    });
  }
}

