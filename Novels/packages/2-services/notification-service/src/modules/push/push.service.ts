import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

export interface SendPushOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly messaging?: admin.messaging.Messaging;

  constructor(private readonly configService: ConfigService) {
    const pushConfig = this.configService.get("push") as {
      projectId?: string;
      clientEmail?: string;
      privateKey?: string;
    };

    if (
      pushConfig?.projectId &&
      pushConfig?.clientEmail &&
      pushConfig?.privateKey
    ) {
      const appName = "notification-service";
      const existingApp = admin.apps.find((app) => app.name === appName);
      const app =
        existingApp ??
        admin.initializeApp(
          {
            credential: admin.credential.cert({
              projectId: pushConfig.projectId,
              clientEmail: pushConfig.clientEmail,
              privateKey: pushConfig.privateKey,
            }),
          },
          appName
        );

      this.messaging = app.messaging();
      this.logger.log("Firebase Admin initialized for push notifications");
    } else {
      this.logger.warn(
        "Firebase credentials missing. Push notifications disabled."
      );
    }
  }

  async send(options: SendPushOptions) {
    if (!this.messaging) {
      this.logger.warn(
        `Skipped push notification because Firebase is not configured`
      );
      return;
    }

    if (!options.tokens?.length) {
      this.logger.warn("Push notification skipped due to empty tokens array");
      return;
    }

    await this.messaging.sendEachForMulticast({
      tokens: options.tokens,
      notification: {
        title: options.title,
        body: options.body,
      },
      data: options.data,
    });

    this.logger.log(
      `Push notification sent to ${options.tokens.length} device(s)`
    );
  }
}


