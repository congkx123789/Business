---
alwaysApply: true
---

├── 📦 notification-service/        # 📧 NOTIFICATION SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Sends notifications (Email, Push, SMS), routes Event Bus jobs, exposes notification preferences API
    │   │   │   ├── **Port:** 3006 (HTTP + gRPC server)
    │   │   │   ├── **Providers:** Nodemailer (email), Firebase Admin (push), Twilio (SMS)
    │   │   │   ├── **gRPC RPCs:** `SendEmail`, `SendTemplateEmail`, `SendPush`, `SendTemplatePush`, `SendSms`, `EnqueueNotification`, `GetNotificationPreferences`, `UpdateNotificationPreferences`
    │   │   │   └── **Events:** Listens to user.registered, comment.replied, user.followed, post.liked, monetization.*, community.*, etc.
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts
    │   │   │       ├── app.module.ts
    │   │   │       │
    │   │   │       ├── 📁 modules/
    │   │   │       │   ├── 📁 common/queue/             # BullMQ + Redis config (Inject queues into NotificationModule)
    │   │   │       │   │   └── queue.module.ts
    │   │   │       │   │
    │   │   │       │   ├── 📁 email/                   # Email Notifications
    │   │   │       │   │   ├── email.module.ts
    │   │   │       │   │   └── email.service.ts        # Nodemailer integration
    │   │   │       │   │
    │   │   │       │   ├── 📁 push/                    # Push Notifications
    │   │   │       │   │   ├── push.module.ts
    │   │   │       │   │   └── push.service.ts         # Firebase Admin integration
    │   │   │       │   │
    │   │   │       │   ├── 📁 sms/                      # SMS Notifications
    │   │   │       │   │   ├── sms.module.ts
    │   │   │       │   │   └── sms.service.ts          # Twilio integration
    │   │   │       │   │
    │   │   │       │   ├── 📁 templates/               # Notification templates renderer
    │   │   │       │   │   ├── templates.module.ts
    │   │   │       │   │   └── notification-template.service.ts
    │   │   │       │   │
    │   │   │       │   └── 📁 notification/            # Delivery orchestrator
    │   │   │       │       ├── notification.module.ts
    │   │   │       │       └── notification.service.ts
    │   │   │       │
    │   │   │       ├── 📁 controllers/
    │   │   │       │   └── notification.controller.ts  # gRPC controller
    │   │   │       │
      │   │   │       └── 📁 workers/                      # Event Bus Workers
      │   │   │           ├── user-events.worker.ts       # user.registered
      │   │   │           ├── comment-events.worker.ts    # comment.replied
      │   │   │           ├── social-events.worker.ts     # user.followed, post.liked, post.commented
      │   │   │           ├── group-events.worker.ts      # group.invite
      │   │   │           ├── monetization-events.worker.ts  # Monetization notifications (NEW) ⭐
      │   │   │           │   │                            # - purchase.completed -> Purchase confirmation email/push
      │   │   │           │   │                            # - wallet.balance.low -> Low balance alert
      │   │   │           │   │                            # - subscription.renewed -> Subscription renewal notification
      │   │   │           │   │                            # - subscription.cancelled -> Cancellation confirmation
      │   │   │           │   │                            # - vip.level.upgraded -> VIP upgrade congratulations
      │   │   │           │   │                            # - privilege.purchased -> Privilege purchase confirmation
      │   │   │           └── community-events.worker.ts  # Fan economy notifications (NEW) ⭐
      │   │   │               │                            # - tip.received -> Tipping received notification
      │   │   │               │                            # - vote.milestone -> Vote milestone notification
      │   │   │               │                            # - fan.ranking.updated -> Ranking update notification
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   └── README.md
    │   │   │
      │   │   └── 📁 Notification Templates
      │   │       ├── templates/email/                    # Email HTML templates
      │   │       │   ├── purchase-confirmation.html     # Purchase confirmation (NEW) ⭐
      │   │       │   ├── subscription-renewal.html     # Subscription renewal (NEW) ⭐
      │   │       │   ├── vip-upgrade.html               # VIP upgrade (NEW) ⭐
      │   │       │   ├── tipping-received.html          # Tipping received (NEW) ⭐
      │   │       │   └── comment-reply.html             # Comment reply (NEW) ⭐
      │   │       └── templates/push/                     # Push notification templates
      │   │           ├── purchase-confirmation.json     # Purchase confirmation push (NEW) ⭐
      │   │           ├── subscription-renewal.json      # Subscription renewal push (NEW) ⭐
      │   │           ├── vip-upgrade.json               # VIP upgrade push (NEW) ⭐
      │   │           ├── tipping-received.json          # Tipping received push (NEW) ⭐
      │   │           └── comment-reply.json             # Comment reply push (NEW) ⭐
    │   │
      │   📝 **Development Steps:** Similar to `search-service`, create Workers (using `@nestjs/bull` 's `@Process()`) that listen for events:
      │   │   │       - Existing: `user.registered`, `comment.replied`
      │   │   │       - New Social Events: `user.followed` (send "You have a new follower"), `post.liked` (send "Someone liked your post"), `group.invite` (send email/push invitation to join group), `post.commented` (send "Someone commented on your post")
      │   │   │       - **New Monetization Events:** `purchase.completed` (send purchase confirmation), `wallet.balance.low` (send low balance alert), `subscription.renewed` (send renewal notification), `subscription.cancelled` (send cancellation confirmation), `vip.level.upgraded` (send VIP upgrade congratulations), `privilege.purchased` (send privilege purchase confirmation)
      │   │   │       - **New Community Events:** `tip.received` (send tipping received notification), `vote.milestone` (send vote milestone notification), `fan.ranking.updated` (send ranking update)
      │   │   │       - Send notifications using `nodemailer` or `firebase-admin`
    │   │
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
