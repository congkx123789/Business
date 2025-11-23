import { registerAs } from "@nestjs/config";
import { GRPC_PORTS, INFRASTRUCTURE_PORTS, SERVICE_PORTS } from "7-shared";

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
  port: toNumber(process.env.STORIES_SERVICE_PORT, SERVICE_PORTS.STORIES_SERVICE), // Port 3002 as per documentation
  grpcUrl:
    process.env.STORIES_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.STORIES_SERVICE}`,
}));

export const databaseConfig = registerAs("database", () => ({
  user: process.env.STORIES_SERVICE_DATABASE_USER ?? "sa",
  password: process.env.STORIES_SERVICE_DATABASE_PASSWORD ?? "yourStrong(!)Password",
  server: process.env.STORIES_SERVICE_DATABASE_HOST ?? "localhost",
  port: toNumber(process.env.STORIES_SERVICE_DATABASE_PORT, INFRASTRUCTURE_PORTS.SQL_SERVER),
  database: process.env.STORIES_SERVICE_DATABASE_NAME ?? "NovelsDb",
  encrypt: toBoolean(process.env.STORIES_SERVICE_DATABASE_ENCRYPT, true),
  connectionTimeout: toNumber(process.env.STORIES_SERVICE_DATABASE_CONNECTION_TIMEOUT, 15000),
  requestTimeout: toNumber(process.env.STORIES_SERVICE_DATABASE_REQUEST_TIMEOUT, 15000),
  pool: {
    max: toNumber(process.env.STORIES_SERVICE_DATABASE_POOL_MAX, 10),
    min: toNumber(process.env.STORIES_SERVICE_DATABASE_POOL_MIN, 2),
    idleTimeoutMillis: toNumber(process.env.STORIES_SERVICE_DATABASE_POOL_IDLE_TIMEOUT, 30000),
  },
}));

export const cacheConfig = registerAs("cache", () => ({
  host: process.env.STORIES_SERVICE_REDIS_HOST ?? "localhost",
  port: toNumber(process.env.STORIES_SERVICE_REDIS_PORT, INFRASTRUCTURE_PORTS.REDIS),
  ttl: toNumber(process.env.STORIES_SERVICE_CACHE_TTL, 300), // 5 minutes default
}));
