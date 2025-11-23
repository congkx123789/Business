# 1-gateway Package

API Gateway (NestJS) - BFF Layer (Backend-for-Frontend). Single entry point for AuthN, Routing, Rate Limiting, Client-specific Optimizations.

## Architecture

- **Role**: Gateway/BFF - Does NOT connect to database (Rule #4)
- **Communication**: Uses gRPC clients to call microservices
- **Port**: 3001 (HTTP REST API)
- **Responsibilities**:
  - Authentication (JWT validation)
  - Routing requests to appropriate microservices
  - Rate Limiting
  - Client-specific optimizations

## Structure

```
1-gateway/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module (NO DatabaseModule)
│   ├── clients/             # gRPC client modules
│   │   ├── users-client.module.ts
│   │   ├── stories-client.module.ts
│   │   └── comments-client.module.ts
│   ├── config/
│   │   └── configuration.ts # Configuration (NO database config)
│   ├── modules/             # REST Controllers (routing only)
│   │   ├── auth/            # AuthN (JWT validation)
│   │   ├── users/           # Routes to users-service
│   │   ├── books/           # Routes to stories-service
│   │   ├── chapters/         # Routes to stories-service
│   │   └── ...
│   └── common/
│       ├── guards/          # JWT Auth Guard
│       ├── filters/         # Exception filters
│       └── pipes/           # Validation pipes
├── package.json
└── tsconfig.json
```

## gRPC Clients

The gateway uses gRPC clients to communicate with microservices:

- **UsersService** (`USERS_SERVICE`) - Port 50051
- **StoriesService** (`STORIES_SERVICE`) - Port 50052
- **CommentsService** (`COMMENTS_SERVICE`) - Port 50053

## Environment Variables

```env
GATEWAY_PORT=3001
GATEWAY_JWT_SECRET=change-me
GATEWAY_JWT_ACCESS_TTL=15m
GATEWAY_JWT_REFRESH_TTL=7d

# gRPC Service URLs
USERS_SERVICE_GRPC_URL=localhost:50051
STORIES_SERVICE_GRPC_URL=localhost:50052
COMMENTS_SERVICE_GRPC_URL=localhost:50053

# Cache (Redis)
GATEWAY_CACHE_ENABLE=false
GATEWAY_CACHE_HOST=localhost
GATEWAY_CACHE_PORT=6379
GATEWAY_CACHE_TTL=60
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm start:dev

# Build
pnpm build

# Run production
pnpm start:prod
```

## Important Notes

- **Rule #4**: Gateway does NOT connect to database
- All business logic is in microservices
- Gateway only handles: AuthN, Routing, Rate Limiting, Client-specific Optimizations
- All data operations go through gRPC clients to microservices

