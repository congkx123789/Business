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
  port: toNumber(process.env.SEARCH_SERVICE_PORT, SERVICE_PORTS.SEARCH_SERVICE),
  grpcUrl:
    process.env.SEARCH_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.SEARCH_SERVICE}`,
}));

export const meilisearchConfig = registerAs("meilisearch", () => ({
  host:
    process.env.SEARCH_SERVICE_MEILISEARCH_HOST ??
    `http://localhost:${INFRASTRUCTURE_PORTS.MEILISEARCH}`,
  apiKey: process.env.SEARCH_SERVICE_MEILISEARCH_API_KEY ?? "masterKey",
}));

