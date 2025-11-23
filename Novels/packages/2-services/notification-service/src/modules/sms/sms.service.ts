import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Twilio } from "twilio";

export interface SendSmsOptions {
  to: string;
  body: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client?: Twilio;
  private readonly fromNumber?: string;

  constructor(private readonly configService: ConfigService) {
    const smsConfig = this.configService.get("sms") as {
      accountSid?: string;
      authToken?: string;
      from?: string;
    };

    this.fromNumber = smsConfig?.from;

    if (smsConfig?.accountSid && smsConfig?.authToken && smsConfig?.from) {
      this.client = new Twilio(smsConfig.accountSid, smsConfig.authToken);
      this.logger.log("Twilio client configured for SMS notifications");
    } else {
      this.logger.warn(
        "Twilio configuration missing. SMS notifications disabled."
      );
    }
  }

  async send(options: SendSmsOptions) {
    if (!this.client || !this.fromNumber) {
      this.logger.warn(
        `Skipped SMS to ${options.to} because Twilio is not configured`
      );
      return;
    }

    await this.client.messages.create({
      to: options.to,
      from: this.fromNumber,
      body: options.body,
    });

    this.logger.log(`SMS sent to ${options.to}`);
  }
}


