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
  port: toNumber(process.env.COMMENTS_SERVICE_PORT, SERVICE_PORTS.COMMENTS_SERVICE),
  grpcUrl:
    process.env.COMMENTS_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.COMMENTS_SERVICE}`,
}));

export const databaseConfig = registerAs("database", () => ({
  url:
    process.env.COMMENTS_SERVICE_DATABASE_URL ??
    process.env.DATABASE_URL ??
    `postgresql://novels_user:novels_password@localhost:${INFRASTRUCTURE_PORTS.POSTGRESQL}/novels_db?schema=comments_service`,
  logQueries: toBoolean(process.env.COMMENTS_SERVICE_DATABASE_LOG_QUERIES, false),
}));

