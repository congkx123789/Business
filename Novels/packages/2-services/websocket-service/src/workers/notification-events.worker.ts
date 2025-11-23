import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { NotificationsGateway } from "../gateways/notifications.gateway";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type NotificationJobData = {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
};

@Processor("notification-events")
@Injectable()
export class NotificationEventsWorker {
  private readonly logger = new Logger(NotificationEventsWorker.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @Process(EVENT_BUS_TOPICS.NOTIFICATION_CREATED)
  async handleNotificationCreated(job: Job<NotificationJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting notification.created for user ${payload.userId}`);
    this.notificationsGateway.emitNotification(payload);
  }
}


