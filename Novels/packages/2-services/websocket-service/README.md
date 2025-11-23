# WebSocket Service

Handles real-time communication (live comments, paragraph bubbles, monetization updates, notifications, and social feed updates). Listens to the Event Bus and broadcasts to WebSocket clients.

## Architecture

- **Database**: None (stateless)
- **Communication**: WebSocket server (Socket.IO) listening on **port 3007**
- **Event Bus Queues**: `comment-events`, `notification-events`, `social-events`, `group-events`, `community-events`, `monetization-events`
- **Technology**: NestJS + Socket.IO + BullMQ

## Structure

```
websocket-service/
├── src/
│   ├── main.ts                     # HTTP + gRPC bootstrap
│   ├── app.module.ts
│   ├── config/configuration.ts     # Port, CORS, gRPC URL
│   ├── common/queue/queue.module.ts
│   ├── gateways/
│   │   ├── app.gateway.ts
│   │   ├── comments.gateway.ts
│   │   ├── community.gateway.ts
│   │   ├── notifications.gateway.ts
│   │   ├── social.gateway.ts
│   │   └── monetization.gateway.ts
│   ├── controllers/
│   │   └── websocket.controller.ts # gRPC controller
│   └── workers/
│       ├── comment-events.worker.ts
│       ├── community-events.worker.ts
│       ├── notification-events.worker.ts
│       ├── social-events.worker.ts
│       ├── group-events.worker.ts
│       └── monetization-events.worker.ts
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## WebSocket Rooms

- `user:{userId}` – personal notifications, follower updates
- `story:{storyId}` – story-level comments, tips, votes, fan rankings
- `chapter:{chapterId}` – paragraph (Duanping) comments
- `group:{groupId}` – social/book club conversations
- `wallet:{userId}` – wallet balance, purchases, VIP/subscription changes
- `global` – platform-wide announcements

## Event Bus Workers

- **CommentEventsWorker** – `comment.created|updated|deleted|replied`
- **CommunityEventsWorker** – `comment.paragraph.*`, `chapter.comment.created`, `tip.created`, `monthly.vote.cast`, `fan.ranking.updated`
- **NotificationEventsWorker** – `notification.created`
- **SocialEventsWorker** – `post.created`, `post.liked`
- **GroupEventsWorker** – `post.created.in.group`, `user.followed`, `group.member.joined`
- **MonetizationEventsWorker** – `wallet.balance.updated`, `purchase.completed`, `subscription.status.changed`, `vip.level.upgraded`

## WebSocket Events

### Client → Server
- `join-room` / `subscribe` – join a room (e.g., `story:123`, `wallet:user-1`)
- `leave-room` / `unsubscribe` – leave a room

### Server → Client
- `comment:created|updated|deleted|replied`
- `paragraph.comment.created|liked|count.updated`
- `chapter.comment.created`
- `notification:created`
- `post:created`, `group:post.created`, `user:followed`
- `wallet.balance.updated`, `purchase.completed`, `subscription.status.changed`, `vip.level.upgraded`
- `tip.created`, `monthly.vote.cast`, `fan.ranking.updated`

## Environment Variables

```env
WEBSOCKET_SERVICE_PORT=3007
WEBSOCKET_SERVICE_GRPC_URL=0.0.0.0:50057
WEBSOCKET_SERVICE_CORS_ORIGIN=*
WEBSOCKET_SERVICE_REDIS_HOST=localhost
WEBSOCKET_SERVICE_REDIS_PORT=6379
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm start:dev

# Build
pnpm build

# Run production build
pnpm start:prod
```

## Client Connection

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3007");

// Join a story room
socket.emit("join-room", "story:123");

// Listen for comments
socket.on("comment:created", (data) => {
  console.log("New comment:", data);
});

// Listen for notifications
socket.emit("join-room", "user:456");
socket.on("notification:created", (data) => {
  console.log("New notification:", data);
});

// Listen for wallet updates
socket.emit("join-room", "wallet:user-456");
socket.on("wallet.balance.updated", (event) => {
  console.log("Wallet updated:", event);
});
```

## gRPC Interface

The service exposes a gRPC interface for direct broadcasts from the Gateway:

### Service: `WebsocketService`

#### `BroadcastEvent`
Broadcasts an event to WebSocket clients in specified rooms.

**Request:**
```protobuf
message BroadcastEventRequest {
  string event = 1;                    // Event name (e.g., "comment:created")
  google.protobuf.Struct payload = 2;  // Event payload
  string room = 3;                     // Single room (e.g., "story:123")
  repeated string rooms = 4;           // Multiple rooms
  string userId = 5;                   // Auto-resolve to "user:{userId}"
  string storyId = 6;                  // Auto-resolve to "story:{storyId}"
  string chapterId = 7;                // Auto-resolve to "chapter:{chapterId}"
  string groupId = 8;                  // Auto-resolve to "group:{groupId}"
  string walletUserId = 9;             // Auto-resolve to "wallet:{walletUserId}"
  bool broadcastAll = 10;              // Broadcast to all connected clients
}
```

**Response:**
```protobuf
message BroadcastResponse {
  bool success = 1;
  string message = 2;
}
```

**Example (Gateway calling WebSocket Service):**
```typescript
// In Gateway service
const client = this.client.getService<WebsocketServiceClient>('WEBSOCKET_SERVICE');
await client.broadcastEvent({
  event: 'comment:created',
  payload: { id: '123', content: 'Great chapter!' },
  storyId: 'story-456',
}).toPromise();
```

## Notes

- This service does **not** connect to a database (Rule #1)
- Broadcasts are triggered by Event Bus jobs (workers) or gRPC calls (gateway)
- Socket.IO is used for connection management, rooms, and broadcasting
- Room-based broadcasting keeps updates targeted and efficient
- gRPC endpoint: `localhost:50057` (default)

