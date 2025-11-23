# Notification Service

Sends transactional notifications (email, push, SMS) and exposes a gRPC surface so other services or the gateway can trigger ad-hoc notifications. It also listens to the Event Bus (BullMQ) for automatic fan economy, monetization, social, and community events.

## Architecture

- **Tech Stack:** NestJS, BullMQ, Nodemailer, Firebase Admin, Twilio
- **Protocols:** gRPC (`notification.proto`) + Event Bus consumers
- **Port:** HTTP 3006, gRPC `0.0.0.0:50060`
- **Storage:** Stateless (no database)
- **Templates:** HTML + JSON templates located in `templates/`

## gRPC Surface

- `SendEmail`
- `SendTemplateEmail`
- `SendPush`
- `SendTemplatePush`
- `SendSms`
- `EnqueueNotification`
- `GetNotificationPreferences`
- `UpdateNotificationPreferences`

> **Note:** Notification preferences are cached in-memory for now to keep the service stateless. A persistent backing store can be wired in later without changing the gRPC contract.

## Source Structure

```
notification-service/
├── src/
│   ├── main.ts                        # Bootstraps HTTP + gRPC server
│   ├── app.module.ts
│   ├── config/configuration.ts        # Email, push, SMS, Redis configs
│   ├── controllers/notification.controller.ts  # gRPC controller
│   ├── common/queue/queue.module.ts   # BullMQ + Redis config
│   ├── modules/
│   │   ├── email/                     # Nodemailer integration
│   │   ├── push/                      # Firebase Admin integration
│   │   ├── sms/                       # Twilio integration
│   │   ├── templates/                 # Template renderer
│   │   └── notification/              # Orchestrates delivery channels
│   └── workers/
│       ├── user-events.worker.ts
│       ├── comment-events.worker.ts
│       ├── social-events.worker.ts
│       ├── group-events.worker.ts
│       ├── monetization-events.worker.ts
│       └── community-events.worker.ts
├── templates/
│   ├── email/*.html                   # HTML templates (purchase, VIP, etc.)
│   └── push/*.json                    # Push notification templates
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Event Bus Workers

| Worker | Queue | Events |
| --- | --- | --- |
| `UserEventsWorker` | `user-events` | `user.created`, `user.registered` |
| `CommentEventsWorker` | `comment-events` | `comment.replied`, `comment.paragraph.replied`, `comment.chapter.replied` |
| `SocialEventsWorker` | `social-events` | `user.followed`, `post.liked`, `post.created.in.group` |
| `GroupEventsWorker` | `group-events` | `group.invite`, `group.member.joined` |
| `MonetizationEventsWorker` | `monetization-events` | `purchase.completed`, `wallet.balance.low`, `subscription.*`, `vip.level.upgraded`, `privilege.purchased` |
| `CommunityEventsWorker` | `community-events` | `tip.received`, `vote.milestone`, `fan.ranking.updated` |

Each worker renders the proper email/push template and falls back to plain copy if templates are missing data.

## Environment Variables

```env
# HTTP + gRPC
NOTIFICATION_SERVICE_PORT=3006
NOTIFICATION_SERVICE_GRPC_URL=0.0.0.0:50060

# Email (Nodemailer)
NOTIFICATION_SERVICE_EMAIL_HOST=smtp.gmail.com
NOTIFICATION_SERVICE_EMAIL_PORT=587
NOTIFICATION_SERVICE_EMAIL_SECURE=false
NOTIFICATION_SERVICE_EMAIL_USER=your-email@gmail.com
NOTIFICATION_SERVICE_EMAIL_PASSWORD=your-app-password
NOTIFICATION_SERVICE_EMAIL_FROM=noreply@novels.app

# Firebase (Push)
NOTIFICATION_SERVICE_FIREBASE_PROJECT_ID=project-id
NOTIFICATION_SERVICE_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project-id.iam.gserviceaccount.com
NOTIFICATION_SERVICE_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Twilio (SMS)
NOTIFICATION_SERVICE_TWILIO_ACCOUNT_SID=ACxxx
NOTIFICATION_SERVICE_TWILIO_AUTH_TOKEN=token
NOTIFICATION_SERVICE_TWILIO_FROM=+1000000000

# Redis (BullMQ)
NOTIFICATION_SERVICE_REDIS_HOST=localhost
NOTIFICATION_SERVICE_REDIS_PORT=6379
NOTIFICATION_SERVICE_REDIS_PASSWORD=
```

## Development

```bash
# Install dependencies (installs firebase-admin + twilio)
pnpm install

# Run in development mode (HTTP + gRPC + workers)
pnpm start:dev

# Build (templates copied via nest assets)
pnpm build

# Run production build
pnpm start:prod
```

## Notes

- Templates live under `templates/` and are loaded at runtime.
- The service is stateless—no database connections.
- Configure Firebase + Twilio credentials to enable push/SMS channels; otherwise the service skips those sends with warnings.
- gRPC contract lives in `7-shared/src/proto/definitions/notification.proto`.

