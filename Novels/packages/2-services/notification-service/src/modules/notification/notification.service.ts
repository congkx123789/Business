import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import {
  COMMUNITY_EVENTS,
  COMMENT_EVENTS,
  MONETIZATION_EVENTS,
  SOCIAL_EVENTS,
  USER_EVENTS,
} from "7-shared";
import {
  EmailAttachmentOptions,
  EmailService,
} from "../email/email.service";
import { PushService, SendPushOptions } from "../push/push.service";
import { SmsService, SendSmsOptions } from "../sms/sms.service";
import {
  EmailTemplateName,
  NotificationTemplateService,
  PushTemplateName,
  TemplateVariables,
} from "../templates/notification-template.service";

export type NotificationChannel = "email" | "push" | "sms";

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachmentOptions[];
}

interface SendTemplateEmailOptions {
  to: string;
  template: EmailTemplateName;
  variables?: TemplateVariables;
  subject?: string;
  locale?: string;
}

interface SendTemplatePushOptions {
  tokens: string[];
  template: PushTemplateName;
  variables?: TemplateVariables;
  locale?: string;
}

interface EnqueueNotificationOptions {
  eventType: string;
  userId?: string;
  data?: Record<string, string>;
  channels?: NotificationChannel[];
  templateId?: string;
}

export interface QuietHourPreference {
  startTime: string;
  endTime: string;
  days: string[];
}

interface NotificationPreferencesRecord {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  topics: Record<string, boolean>;
  quietHours: QuietHourPreference[];
  updatedAt: Date;
}

export interface TimestampProto {
  seconds: number;
  nanos: number;
}

export interface NotificationPreferencesResponse {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  topics: Record<string, boolean>;
  quietHours: QuietHourPreference[];
  updatedAt: TimestampProto;
}

interface UpdateNotificationPreferencesOptions {
  userId: string;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  topics?: Record<string, boolean>;
  quietHours?: QuietHourPreference[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly eventQueueRegistry = new Map<string, Queue>();
  private readonly preferencesStore = new Map<
    string,
    NotificationPreferencesRecord
  >();

  constructor(
    private readonly emailService: EmailService,
    private readonly pushService: PushService,
    private readonly smsService: SmsService,
    private readonly templateService: NotificationTemplateService,
    @InjectQueue("user-events")
    private readonly userEventsQueue: Queue,
    @InjectQueue("comment-events")
    private readonly commentEventsQueue: Queue,
    @InjectQueue("social-events")
    private readonly socialEventsQueue: Queue,
    @InjectQueue("group-events")
    private readonly groupEventsQueue: Queue,
    @InjectQueue("monetization-events")
    private readonly monetizationEventsQueue: Queue,
    @InjectQueue("community-events")
    private readonly communityEventsQueue: Queue
  ) {
    this.registerQueueEvents();
  }

  async sendWelcomeEmail(data: { email: string; username?: string }) {
    await this.sendEmail({
      to: data.email,
      subject: "Welcome to StorySphere!",
      html: `
        <h1>Welcome ${data.username ?? "Explorer"}!</h1>
        <p>Thank you for joining StorySphere. Start reading amazing stories today!</p>
      `,
    });
  }

  async sendEmail(options: SendEmailOptions) {
    if (!options.html && !options.text) {
      this.logger.warn(
        `Skipped email to ${options.to} because no html or text body provided`
      );
      return;
    }

    try {
      await this.emailService.send({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async sendTemplateEmail(options: SendTemplateEmailOptions) {
    const html = this.templateService.renderEmail(
      options.template,
      options.variables
    );

    await this.sendEmail({
      to: options.to,
      subject:
        options.subject ??
        this.buildFallbackSubject(options.template, options.variables),
      html,
    });
  }

  async sendPush(options: SendPushOptions) {
    try {
      await this.pushService.send(options);
    } catch (error) {
      this.logger.error(
        `Failed to send push notification: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async sendTemplatePush(options: SendTemplatePushOptions) {
    const payload = this.templateService.renderPush(
      options.template,
      options.variables
    );

    if (!payload) {
      this.logger.warn(
        `Skipped template push notification because payload could not be rendered`
      );
      return;
    }

    await this.sendPush({
      tokens: options.tokens,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
  }

  async sendSms(options: SendSmsOptions) {
    try {
      await this.smsService.send(options);
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${options.to}: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async enqueueNotification(options: EnqueueNotificationOptions) {
    const queue = this.eventQueueRegistry.get(options.eventType);
    if (!queue) {
      throw new Error(`Unsupported event type: ${options.eventType}`);
    }

    const payload = {
      userId: options.userId,
      channels: options.channels,
      templateId: options.templateId,
      ...this.deserializeData(options.data),
    };

    await queue.add(options.eventType, payload);
  }

  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferencesResponse> {
    const record = this.getOrCreatePreferences(userId);
    return this.toPreferencesResponse(record);
  }

  async updateNotificationPreferences(
    options: UpdateNotificationPreferencesOptions
  ): Promise<NotificationPreferencesResponse> {
    const record = this.getOrCreatePreferences(options.userId);

    if (options.emailEnabled !== undefined) {
      record.emailEnabled = options.emailEnabled;
    }

    if (options.pushEnabled !== undefined) {
      record.pushEnabled = options.pushEnabled;
    }

    if (options.smsEnabled !== undefined) {
      record.smsEnabled = options.smsEnabled;
    }

    if (options.topics) {
      record.topics = {
        ...record.topics,
        ...options.topics,
      };
    }

    if (options.quietHours) {
      record.quietHours = options.quietHours;
    }

    record.updatedAt = new Date();
    this.preferencesStore.set(options.userId, record);

    return this.toPreferencesResponse(record);
  }

  private buildFallbackSubject(
    template: EmailTemplateName,
    variables: TemplateVariables = {}
  ) {
    switch (template) {
      case "purchase-confirmation":
        return `Purchase confirmed for ${variables.storyTitle ?? "your story"}`;
      case "subscription-renewal":
        return "Your subscription has been renewed";
      case "vip-upgrade":
        return "Welcome to your new VIP tier";
      case "tipping-received":
        return "You just received a tip!";
      case "comment-reply":
        return "Someone replied to your comment";
      default:
        return "Notification from StorySphere";
    }
  }

  private registerQueueEvents() {
    Object.values(USER_EVENTS).forEach((event) =>
      this.eventQueueRegistry.set(event, this.userEventsQueue)
    );

    Object.values(COMMENT_EVENTS).forEach((event) =>
      this.eventQueueRegistry.set(event, this.commentEventsQueue)
    );

    const groupSpecificEvents = new Set<string>([
      SOCIAL_EVENTS.GROUP_INVITE,
      SOCIAL_EVENTS.GROUP_MEMBER_JOINED,
    ]);

    Object.values(SOCIAL_EVENTS).forEach((event) => {
      const queue = groupSpecificEvents.has(event)
        ? this.groupEventsQueue
        : this.socialEventsQueue;
      this.eventQueueRegistry.set(event, queue);
    });

    Object.values(MONETIZATION_EVENTS).forEach((event) =>
      this.eventQueueRegistry.set(event, this.monetizationEventsQueue)
    );

    Object.values(COMMUNITY_EVENTS).forEach((event) =>
      this.eventQueueRegistry.set(event, this.communityEventsQueue)
    );
  }

  private deserializeData(
    data?: Record<string, string>
  ): Record<string, unknown> {
    if (!data) {
      return {};
    }

    return Object.entries(data).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        acc[key] = this.coerceValue(value);
        return acc;
      },
      {}
    );
  }

  private coerceValue(value: string): unknown {
    const trimmed = value?.trim();
    if (trimmed === undefined || trimmed === "") {
      return "";
    }

    if (trimmed === "true" || trimmed === "false") {
      return trimmed === "true";
    }

    if (!Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch (error) {
        this.logger.warn(
          `Failed to parse JSON value "${trimmed}": ${
            error instanceof Error ? error.message : error
          }`
        );
      }
    }

    return value;
  }

  private getOrCreatePreferences(
    userId: string
  ): NotificationPreferencesRecord {
    if (this.preferencesStore.has(userId)) {
      return this.preferencesStore.get(userId) as NotificationPreferencesRecord;
    }

    const defaults: NotificationPreferencesRecord = {
      userId,
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      topics: {},
      quietHours: [],
      updatedAt: new Date(),
    };

    this.preferencesStore.set(userId, defaults);
    return defaults;
  }

  private toPreferencesResponse(
    record: NotificationPreferencesRecord
  ): NotificationPreferencesResponse {
    return {
      userId: record.userId,
      emailEnabled: record.emailEnabled,
      pushEnabled: record.pushEnabled,
      smsEnabled: record.smsEnabled,
      topics: record.topics,
      quietHours: record.quietHours,
      updatedAt: this.toTimestamp(record.updatedAt),
    };
  }

  private toTimestamp(date: Date): TimestampProto {
    const milliseconds = date.getTime();
    const seconds = Math.floor(milliseconds / 1000);
    const nanos = (milliseconds % 1000) * 1_000_000;
    return { seconds, nanos };
  }
}

