import { registerAs } from "@nestjs/config";
import { GRPC_PORTS, SERVICE_PORTS } from "7-shared";

type Convertible<T> = T | string | undefined;

const toNumber = (value: Convertible<number>, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: Convertible<boolean>, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value === "true";
  }
  return fallback;
};

export const appConfig = registerAs("app", () => ({
  port: toNumber(process.env.GATEWAY_PORT, SERVICE_PORTS.GATEWAY),
  // gRPC Service URLs
  usersServiceGrpcUrl: process.env.USERS_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.USERS_SERVICE}`,
  storiesServiceGrpcUrl: process.env.STORIES_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.STORIES_SERVICE}`,
  commentsServiceGrpcUrl: process.env.COMMENTS_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.COMMENTS_SERVICE}`,
  searchServiceGrpcUrl: process.env.SEARCH_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.SEARCH_SERVICE}`,
  aiServiceGrpcUrl: process.env.AI_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.AI_SERVICE}`,
  notificationServiceGrpcUrl: process.env.NOTIFICATION_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.NOTIFICATION_SERVICE}`,
  websocketServiceGrpcUrl: process.env.WEBSOCKET_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.WEBSOCKET_SERVICE}`,
  socialServiceGrpcUrl: process.env.SOCIAL_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.SOCIAL_SERVICE}`,
  communityServiceGrpcUrl: process.env.COMMUNITY_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.COMMUNITY_SERVICE}`,
  monetizationServiceGrpcUrl: process.env.MONETIZATION_SERVICE_GRPC_URL ?? `localhost:${GRPC_PORTS.MONETIZATION_SERVICE}`,
}));

// Removed databaseConfig - Gateway should NOT connect to database (Rule #4)

export const cacheConfig = registerAs("cache", () => ({
  enable: toBoolean(process.env.GATEWAY_CACHE_ENABLE, false),
  host: process.env.GATEWAY_CACHE_HOST ?? "localhost",
  port: toNumber(process.env.GATEWAY_CACHE_PORT, 6379),
  ttl: toNumber(process.env.GATEWAY_CACHE_TTL, 60),
}));

export const jwtConfig = registerAs("jwt", () => ({
  secret: process.env.GATEWAY_JWT_SECRET ?? "change-me",
  accessTokenTtl: process.env.GATEWAY_JWT_ACCESS_TTL ?? "15m",
  refreshTokenTtl: process.env.GATEWAY_JWT_REFRESH_TTL ?? "7d",
}));

