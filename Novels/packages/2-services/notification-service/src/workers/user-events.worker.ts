import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { EVENT_BUS_TOPICS } from "7-shared";
import { NotificationService } from "../modules/notification/notification.service";

interface UserEventPayload {
  email?: string;
  username?: string;
}

@Processor("user-events")
@Injectable()
export class UserEventsWorker {
  private readonly logger = new Logger(UserEventsWorker.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(EVENT_BUS_TOPICS.USER_REGISTERED)
  async handleUserRegistered(job: Job<UserEventPayload>) {
    await this.sendWelcome(job);
  }

  @Process(EVENT_BUS_TOPICS.USER_CREATED)
  async handleUserCreated(job: Job<UserEventPayload>) {
    await this.sendWelcome(job);
  }

  private async sendWelcome(job: Job<UserEventPayload>) {
    const { email, username } = job.data ?? {};
    if (!email) {
      this.logger.warn("Received user event without email address");
      return;
    }

    await this.notificationService.sendWelcomeEmail({
      email,
      username,
    });
  }
}


