import { registerAs } from "@nestjs/config";
import {
  GRPC_PORTS,
  INFRASTRUCTURE_PORTS,
  SERVICE_PORTS,
} from "7-shared";

type Convertible<T> = T | string | undefined;

const toNumber = (value: Convertible<number>, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveNumber = (value: Convertible<number>, fallback: number) => {
  const parsed = toNumber(value, fallback);
  return parsed > 0 ? parsed : fallback;
};

export const appConfig = registerAs("app", () => ({
  port: toNumber(process.env.AI_SERVICE_PORT, SERVICE_PORTS.AI_SERVICE),
  grpcUrl:
    process.env.AI_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.AI_SERVICE}`,
}));

export const aiConfig = registerAs("ai", () => ({
  googleApiKey: process.env.AI_SERVICE_GOOGLE_API_KEY ?? "",
  model: process.env.AI_SERVICE_MODEL ?? "gemini-pro",
  maxTokens: toNumber(process.env.AI_SERVICE_MAX_TOKENS, 1000),
}));

export const cacheConfig = registerAs("cache", () => ({
  defaultTtlSeconds: toNumber(process.env.AI_SERVICE_CACHE_TTL_SECONDS, 3600),
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: toNumber(process.env.REDIS_PORT, INFRASTRUCTURE_PORTS.REDIS),
    password: process.env.REDIS_PASSWORD,
    db: toNumber(process.env.REDIS_DB, 0),
  },
}));

export const storageConfig = registerAs("storage", () => ({
  bucket: process.env.AI_SERVICE_S3_BUCKET ?? "ai-service-tts",
  region: process.env.AI_SERVICE_S3_REGION ?? "ap-southeast-1",
  publicBaseUrl: process.env.AI_SERVICE_S3_PUBLIC_URL ?? "https://cdn.local/ai",
  prefix: process.env.AI_SERVICE_S3_PREFIX ?? "tts",
}));

export const servicesConfig = registerAs("services", () => ({
  storiesGrpcUrl:
    process.env.STORIES_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.STORIES_SERVICE}`,
  storiesRetryAttempts: toPositiveNumber(process.env.STORIES_SERVICE_RETRY_ATTEMPTS, 3),
  storiesRetryDelayMs: toPositiveNumber(process.env.STORIES_SERVICE_RETRY_DELAY_MS, 250),
  storiesRetryBackoffMultiplier: toPositiveNumber(process.env.STORIES_SERVICE_RETRY_BACKOFF, 2),
  storiesRpcTimeoutMs: toPositiveNumber(process.env.STORIES_SERVICE_RPC_TIMEOUT_MS, 2000),
}));

