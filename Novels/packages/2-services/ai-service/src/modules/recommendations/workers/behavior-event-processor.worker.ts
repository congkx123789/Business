import { Injectable, Logger } from "@nestjs/common";

interface BehaviorEvent {
  type: string;
  userId: number;
  payload: Record<string, unknown>;
}

@Injectable()
export class BehaviorEventProcessorWorker {
  private readonly logger = new Logger(BehaviorEventProcessorWorker.name);

  async process(event: BehaviorEvent) {
    this.logger.verbose(`Processing behavior event ${event.type} for user ${event.userId}`);
    // TODO: forward events to analytics pipeline / update user behavior profiles
  }
}


