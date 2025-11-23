import { Module } from "@nestjs/common";
import { QueueModule } from "../../common/queue/queue.module";
import { EmailModule } from "../email/email.module";
import { PushModule } from "../push/push.module";
import { SmsModule } from "../sms/sms.module";
import { TemplatesModule } from "../templates/templates.module";
import { NotificationService } from "./notification.service";

@Module({
  imports: [QueueModule, EmailModule, PushModule, SmsModule, TemplatesModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}


