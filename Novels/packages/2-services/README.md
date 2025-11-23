# 2-services Package

This package contains all Microservices for the application. Each service is independent and owns its own database.

## Architecture

- **Internal Sync Communication**: Services communicate via **gRPC** for synchronous, immediate needs
- **Internal Async Communication**: Services communicate via **Event Bus (Redis/BullMQ)** for asynchronous updates
- **Database**: Each service owns its database (Rule #1 - The Golden Rule)
- **Technology Stack**:
  - `@nestjs/microservices` (as gRPC Server)
  - `@nestjs/prisma` (as ORM for PostgreSQL)
  - `@nestjs/bull` (as Job Queue Manager)
  - `meilisearch` (client for search-service)
  - `aws-sdk` (client for S3)

## Services Structure

```
2-services/
├── users-service/        # ✅ Manages Users, Profiles, Library, Auth (JWT) - Port 50051
├── stories-service/       # ✅ Manages Stories, Chapters, Genres - Port 50052 + Event Bus
├── comments-service/     # ✅ Manages Comments, Ratings - Port 50053
├── search-service/        # ✅ Manages Search (Connects to MeiliSearch) - Port 50054
├── ai-service/           # ✅ Handles AI (Summaries, Translation, Recommendations) - Port 50055
├── notification-service/ # ✅ Handles sending notifications (Email, Push) - Port 3007
└── websocket-service/    # ✅ Handles real-time communication (Live comments, notifications) - Port 3008
```

## Service Status

- ✅ **users-service**: Complete with gRPC server
- ✅ **stories-service**: Complete with gRPC server + Event Bus (emits events)
- ✅ **comments-service**: Complete with gRPC server
- ✅ **search-service**: Complete with gRPC server + Event Bus worker (listens to story events)
- ✅ **ai-service**: Complete with gRPC server (Google Gemini integration)
- ✅ **notification-service**: Complete with Event Bus workers (listens to user/comment events)
- ✅ **websocket-service**: Complete with WebSocket Gateway + Event Bus workers (real-time updates)

## Development Guidelines

1. **Never touch another service's database** (Rule #1)
2. Use gRPC for synchronous communication
3. Use Event Bus for asynchronous communication
4. Each service should have its own `package.json` and be independently deployable
5. All gRPC proto files are defined in `7-shared/src/proto/`

## Getting Started

Each service should be set up as a separate NestJS application with its own dependencies and configuration.

