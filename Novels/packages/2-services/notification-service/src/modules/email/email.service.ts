import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export interface EmailAttachmentOptions {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachmentOptions[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter?: nodemailer.Transporter;
  private readonly fromAddress?: string;

  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.get("email") as {
      host?: string;
      port?: number;
      secure?: boolean;
      user?: string;
      password?: string;
      from?: string;
    };

    this.fromAddress = emailConfig?.from;

    if (emailConfig?.user && emailConfig?.password && emailConfig?.host) {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port ?? 587,
        secure: emailConfig.secure ?? false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });
      this.logger.log("Email transporter configured");
    } else {
      this.logger.warn(
        "Email transporter not configured. Missing SMTP credentials."
      );
    }
  }

  async send(options: SendEmailOptions) {
    if (!this.transporter) {
      this.logger.warn(
        `Skipped email delivery to ${options.to} because transporter is not configured`
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.fromAddress ?? "noreply@notifications.local",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: this.mapAttachments(options.attachments),
    });

    this.logger.log(`Email sent to ${options.to}`);
  }

  private mapAttachments(
    attachments?: EmailAttachmentOptions[]
  ): Mail.Attachment[] | undefined {
    if (!attachments?.length) {
      return undefined;
    }

    return attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    }));
  }
}


