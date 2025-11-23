import { registerAs } from "@nestjs/config";
import { Prisma } from "@prisma/users-service-client";
import { GRPC_PORTS, INFRASTRUCTURE_PORTS, SERVICE_PORTS } from "7-shared";

type Convertible<T> = T | string | undefined;

const toNumber = (value: Convertible<number>, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseLogLevels = (value: string | undefined): Prisma.LogLevel[] => {
  if (!value) {
    return ["error"];
  }

  return value
    .split(",")
    .map((level) => level.trim())
    .filter((level): level is Prisma.LogLevel => ["query", "info", "warn", "error"].includes(level as Prisma.LogLevel));
};

export const appConfig = registerAs("app", () => ({
  port: toNumber(process.env.USERS_SERVICE_PORT, SERVICE_PORTS.USERS_SERVICE),
  grpcUrl:
    process.env.USERS_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.USERS_SERVICE}`,
}));

export const databaseConfig = registerAs("database", () => ({
  url:
    process.env.USERS_SERVICE_DATABASE_URL ??
    `postgresql://${process.env.USERS_SERVICE_DATABASE_USER ?? "novels_user"}:${encodeURIComponent(
      process.env.USERS_SERVICE_DATABASE_PASSWORD ?? "novels_password"
    )}@${process.env.USERS_SERVICE_DATABASE_HOST ?? "localhost"}:${toNumber(
      process.env.USERS_SERVICE_DATABASE_PORT,
      INFRASTRUCTURE_PORTS.POSTGRESQL
    )}/${process.env.USERS_SERVICE_DATABASE_NAME ?? "novels_db"}?schema=${
      process.env.USERS_SERVICE_DATABASE_SCHEMA ?? "users_service"
    }`,
  logLevels: parseLogLevels(process.env.USERS_SERVICE_DATABASE_LOG_LEVELS),
}));

export const jwtConfig = registerAs("jwt", () => ({
  secret: process.env.USERS_SERVICE_JWT_SECRET ?? "change-me",
  accessTokenTtl: process.env.USERS_SERVICE_JWT_ACCESS_TTL ?? "15m",
  refreshTokenTtl: process.env.USERS_SERVICE_JWT_REFRESH_TTL ?? "7d",
}));

