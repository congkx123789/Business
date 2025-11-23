import { randomUUID } from "crypto";
import { Controller, Logger } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { EmailAttachmentOptions } from "../modules/email/email.service";
import {
  NotificationChannel,
  NotificationPreferencesResponse,
  NotificationService,
  QuietHourPreference,
} from "../modules/notification/notification.service";
import {
  EMAIL_TEMPLATE_IDS,
  EmailTemplateName,
  PUSH_TEMPLATE_IDS,
  PushTemplateName,
  TemplateVariables,
} from "../modules/templates/notification-template.service";

interface EmailAttachmentRequest {
  filename: string;
  content: Buffer | Uint8Array | string;
  contentType?: string;
}

interface SendEmailRequest {
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  attachments?: EmailAttachmentRequest[];
  metadata?: Record<string, string>;
  locale?: string;
}

interface SendTemplateEmailRequest {
  to: string;
  templateId: string;
  variables?: Record<string, string>;
  subject?: string;
  locale?: string;
}

interface SendPushRequest {
  tokens: string[];
  title?: string;
  body?: string;
  data?: Record<string, string>;
  priority?: string;
}

interface SendTemplatePushRequest {
  tokens: string[];
  templateId: string;
  variables?: Record<string, string>;
  locale?: string;
}

interface SendSmsRequest {
  to: string;
  body: string;
  senderId?: string;
}

interface NotificationEventRequest {
  eventType: string;
  userId?: string;
  data?: Record<string, string>;
  channels?: string[];
  templateId?: string;
}

interface GetNotificationPreferencesRequest {
  userId: string;
}

interface QuietHourRequest {
  startTime: string;
  endTime: string;
  days: string[];
}

interface UpdateNotificationPreferencesRequest {
  userId: string;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  topics?: Record<string, boolean>;
  quietHours?: QuietHourRequest[];
}

interface NotificationResult {
  accepted: boolean;
  notificationId: string;
  message?: string;
}

const EMAIL_TEMPLATE_SET = new Set<EmailTemplateName>(EMAIL_TEMPLATE_IDS);
const PUSH_TEMPLATE_SET = new Set<PushTemplateName>(PUSH_TEMPLATE_IDS);
const VALID_CHANNELS: ReadonlySet<NotificationChannel> = new Set([
  "email",
  "push",
  "sms",
]);

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod("NotificationService", "SendEmail")
  async sendEmail(request: SendEmailRequest): Promise<NotificationResult> {
    if (!request.to || !request.subject) {
      return this.failureResult("Missing recipient or subject");
    }

    if (!request.htmlBody && !request.textBody) {
      return this.failureResult("Either htmlBody or textBody must be provided");
    }

    const attachments = this.mapAttachments(request.attachments);

    await this.notificationService.sendEmail({
      to: request.to,
      subject: request.subject,
      html: request.htmlBody,
      text: request.textBody,
      attachments,
    });

    return this.successResult("Email dispatched");
  }

  @GrpcMethod("NotificationService", "SendTemplateEmail")
  async sendTemplateEmail(
    request: SendTemplateEmailRequest
  ): Promise<NotificationResult> {
    if (!request.to) {
      return this.failureResult("Recipient is required");
    }

    const template = this.resolveEmailTemplate(request.templateId);
    if (!template) {
      return this.failureResult(
        `Unknown email template: ${request.templateId}`
      );
    }

    await this.notificationService.sendTemplateEmail({
      to: request.to,
      template,
      subject: request.subject,
      variables: this.toTemplateVariables(request.variables),
      locale: request.locale,
    });

    return this.successResult("Template email dispatched");
  }

  @GrpcMethod("NotificationService", "SendPush")
  async sendPush(request: SendPushRequest): Promise<NotificationResult> {
    if (!request.tokens?.length) {
      return this.failureResult("Push tokens are required");
    }

    if (!request.title || !request.body) {
      return this.failureResult("Title and body are required for push");
    }

    await this.notificationService.sendPush({
      tokens: request.tokens,
      title: request.title,
      body: request.body,
      data: request.data,
    });

    return this.successResult("Push notification dispatched");
  }

  @GrpcMethod("NotificationService", "SendTemplatePush")
  async sendTemplatePush(
    request: SendTemplatePushRequest
  ): Promise<NotificationResult> {
    if (!request.tokens?.length) {
      return this.failureResult("Push tokens are required");
    }

    const template = this.resolvePushTemplate(request.templateId);
    if (!template) {
      return this.failureResult(
        `Unknown push template: ${request.templateId}`
      );
    }

    await this.notificationService.sendTemplatePush({
      tokens: request.tokens,
      template,
      variables: this.toTemplateVariables(request.variables),
      locale: request.locale,
    });

    return this.successResult("Template push dispatched");
  }

  @GrpcMethod("NotificationService", "SendSms")
  async sendSms(request: SendSmsRequest): Promise<NotificationResult> {
    if (!request.to || !request.body) {
      return this.failureResult("SMS recipient and body are required");
    }

    await this.notificationService.sendSms({
      to: request.to,
      body: request.body,
    });

    return this.successResult("SMS dispatched");
  }

  @GrpcMethod("NotificationService", "EnqueueNotification")
  async enqueueNotification(
    request: NotificationEventRequest
  ): Promise<NotificationResult> {
    if (!request.eventType) {
      return this.failureResult("eventType is required");
    }

    try {
      await this.notificationService.enqueueNotification({
        eventType: request.eventType,
        userId: request.userId,
        data: request.data,
        channels: this.mapChannels(request.channels),
        templateId: request.templateId,
      });
      return this.successResult("Notification enqueued");
    } catch (error) {
      this.logger.error(
        `Failed to enqueue notification: ${
          error instanceof Error ? error.message : error
        }`
      );
      return this.failureResult("Unsupported event type");
    }
  }

  @GrpcMethod("NotificationService", "GetNotificationPreferences")
  async getNotificationPreferences(
    request: GetNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    if (!request.userId) {
      throw new Error("userId is required");
    }

    return this.notificationService.getNotificationPreferences(request.userId);
  }

  @GrpcMethod("NotificationService", "UpdateNotificationPreferences")
  async updateNotificationPreferences(
    request: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesResponse> {
    if (!request.userId) {
      throw new Error("userId is required");
    }

    return this.notificationService.updateNotificationPreferences({
      userId: request.userId,
      emailEnabled: request.emailEnabled,
      pushEnabled: request.pushEnabled,
      smsEnabled: request.smsEnabled,
      topics: request.topics,
      quietHours: this.mapQuietHours(request.quietHours),
    });
  }

  private mapAttachments(
    attachments?: EmailAttachmentRequest[]
  ): EmailAttachmentOptions[] | undefined {
    if (!attachments?.length) {
      return undefined;
    }

    const mapped = attachments
      .map((attachment) => {
        if (!attachment.filename || !attachment.content) {
          return null;
        }

        const content = this.normalizeAttachmentContent(attachment.content);

        return {
          filename: attachment.filename,
          content,
          contentType: attachment.contentType,
        };
      })
      .filter(
        (attachment): attachment is EmailAttachmentOptions => attachment !== null
      );

    return mapped.length ? mapped : undefined;
  }

  private normalizeAttachmentContent(
    content: Buffer | Uint8Array | string
  ): Buffer | string {
    if (Buffer.isBuffer(content)) {
      return content;
    }

    if (typeof content === "string") {
      try {
        return Buffer.from(content, "base64");
      } catch {
        return content;
      }
    }

    return Buffer.from(content);
  }

  private toTemplateVariables(
    variables?: Record<string, string>
  ): TemplateVariables | undefined {
    if (!variables) {
      return undefined;
    }

    return Object.entries(variables).reduce<TemplateVariables>(
      (acc, [key, value]) => {
        if (value === undefined || value === null) {
          acc[key] = undefined;
          return acc;
        }

        const trimmed = value.trim();
        if (trimmed === "") {
          acc[key] = "";
          return acc;
        }

        const numeric = Number(trimmed);
        acc[key] = Number.isNaN(numeric) ? value : numeric;
        return acc;
      },
      {}
    );
  }

  private mapChannels(
    channels?: string[]
  ): NotificationChannel[] | undefined {
    if (!channels?.length) {
      return undefined;
    }

    const normalized = channels
      .map((channel) => channel?.toLowerCase().trim())
      .filter(
        (channel): channel is NotificationChannel =>
          !!channel && VALID_CHANNELS.has(channel as NotificationChannel)
      );

    return normalized.length ? normalized : undefined;
  }

  private mapQuietHours(
    quietHours?: QuietHourRequest[]
  ): QuietHourPreference[] | undefined {
    if (!quietHours?.length) {
      return undefined;
    }

    return quietHours
      .filter((hour) => hour.startTime && hour.endTime)
      .map((hour) => ({
        startTime: hour.startTime,
        endTime: hour.endTime,
        days: hour.days ?? [],
      }));
  }

  private resolveEmailTemplate(
    templateId?: string
  ): EmailTemplateName | null {
    if (!templateId) {
      return null;
    }

    return EMAIL_TEMPLATE_SET.has(templateId as EmailTemplateName)
      ? (templateId as EmailTemplateName)
      : null;
  }

  private resolvePushTemplate(
    templateId?: string
  ): PushTemplateName | null {
    if (!templateId) {
      return null;
    }

    return PUSH_TEMPLATE_SET.has(templateId as PushTemplateName)
      ? (templateId as PushTemplateName)
      : null;
  }

  private successResult(message: string): NotificationResult {
    return {
      accepted: true,
      notificationId: randomUUID(),
      message,
    };
  }

  private failureResult(message: string): NotificationResult {
    return {
      accepted: false,
      notificationId: randomUUID(),
      message,
    };
  }
}


