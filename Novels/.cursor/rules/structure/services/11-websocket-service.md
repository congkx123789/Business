---
alwaysApply: true
---

├── 📦 websocket-service/          # 🔌 WEBSOCKET SERVICE
    │   │   │
    │   │   ├── 📋 Service Info
    │   │   │   ├── **Purpose:** Real-time communication (Live comments, notifications, social updates)
    │   │   │   ├── **Port:** 3007 (WebSocket server)
    │   │   │   ├── **Tech:** Socket.IO (NestJS WebSocket adapter)
    │   │   │   └── **Events:** Listens to Event Bus, emits to WebSocket clients
    │   │   │
    │   │   ├── 📁 Source Code Structure
    │   │   │   └── src/
    │   │   │       ├── main.ts
    │   │   │       ├── app.module.ts
    │   │   │       │
      │   │   │       ├── 📁 gateways/                    # WebSocket Gateways
      │   │   │       │   ├── comments.gateway.ts          # Live comments WebSocket
      │   │   │       │   ├── notifications.gateway.ts   # Real-time notifications
      │   │   │       │   ├── social.gateway.ts           # Social feed updates
      │   │   │       │   ├── monetization.gateway.ts     # Monetization real-time updates (NEW) ⭐
      │   │   │       │   │   │                            # - Purchase confirmations
      │   │   │       │   │   │                            # - Wallet balance updates
      │   │   │       │   │   │                            # - Subscription status changes
      │   │   │       │   │   │                            # - VIP level upgrades
      │   │   │       │   └── community.gateway.ts        # Community real-time updates (NEW) ⭐
      │   │   │       │       │                            # - Paragraph comment bubbles
      │   │   │       │       │                            # - Comment like updates
      │   │   │       │       │                            # - Tipping notifications
      │   │   │       │       │                            # - Vote updates
      │   │   │       │       │                            # - Fan ranking updates
    │   │   │       │
    │   │   │       ├── 📁 controllers/
    │   │   │       │   └── websocket.controller.ts     # gRPC controller (if needed)
    │   │   │       │
      │   │   │       └── 📁 workers/                      # Event Bus Workers
      │   │   │           ├── comment-events.worker.ts     # comment.created -> emit to room
      │   │   │           ├── notification-events.worker.ts  # notification.created -> emit to user room
      │   │   │           ├── social-events.worker.ts      # post.created -> emit to followers
      │   │   │           ├── group-events.worker.ts      # group events -> emit to group room
      │   │   │           ├── monetization-events.worker.ts  # Monetization events (NEW) ⭐
      │   │   │           │   │                            # - purchase.completed -> emit purchase confirmation
      │   │   │           │   │                            # - wallet.balance.updated -> emit balance update
      │   │   │           │   │                            # - subscription.status.changed -> emit subscription update
      │   │   │           │   │                            # - vip.level.upgraded -> emit VIP upgrade notification
      │   │   │           └── community-events.worker.ts   # Community events (NEW) ⭐
      │   │   │               │                            # - comment.paragraph.created -> emit paragraph comment bubble
      │   │   │               │                            # - comment.paragraph.liked -> emit like update
      │   │   │               │                            # - tip.created -> emit tipping notification
      │   │   │               │                            # - monthly.vote.cast -> emit vote update
      │   │   │               │                            # - fan.ranking.updated -> emit ranking update
    │   │   │
    │   │   ├── 📁 Configuration Files
    │   │   │   ├── package.json
    │   │   │   └── README.md
    │   │   │
      │   │   └── 📁 WebSocket Rooms
      │   │       ├── User rooms                          # user:{userId} - personal notifications
      │   │       ├── Story rooms                         # story:{storyId} - live comments
      │   │       ├── Group rooms                         # group:{groupId} - group updates
      │   │       ├── Chapter rooms                       # chapter:{chapterId} - paragraph comments (NEW) ⭐
      │   │       ├── Wallet rooms                        # wallet:{userId} - monetization updates (NEW) ⭐
      │   │       └── Global rooms                        # Global announcements
    │   │
    │   📝 **Development Steps:**
    │   │   │       1.  Setup NestJS with `@nestjs/websockets` (using `socket.io` adapter).
    │   │   │       2.  Listen to the Event Bus (using `@nestjs/bull` 's `@Process()`).
    │   │   │       3.  On event receipt (e.g., `comment.created`), use the WebSocket Gateway (using `@WebSocketGateway()`) to `emit` data to clients in the correct "room".
    │   │   │       4.  **New Social Events:** Listen for `post.created` -> Emit to "room" of user's followers (`user:{followerId}`).
    │   │   │       5.  Listen for `post.created.in.group` -> Emit to group room (`group:{groupId}`).
    │   │   │       6.  Listen for `user.followed` -> Emit to user's room for real-time follower count updates.
    │   │
    │

---

**Xem thêm:** [README](./README.md) | [Overview](./01-overview.md)
