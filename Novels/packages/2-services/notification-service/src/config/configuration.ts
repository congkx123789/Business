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

const normalizePrivateKey = (value?: string) =>
  value ? value.replace(/\\n/g, "\n") : undefined;

export const appConfig = registerAs("app", () => ({
  port: toNumber(process.env.NOTIFICATION_SERVICE_PORT, SERVICE_PORTS.NOTIFICATION_SERVICE),
  grpcUrl:
    process.env.NOTIFICATION_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.NOTIFICATION_SERVICE}`,
}));

export const emailConfig = registerAs("email", () => ({
  host: process.env.NOTIFICATION_SERVICE_EMAIL_HOST ?? "smtp.gmail.com",
  port: toNumber(process.env.NOTIFICATION_SERVICE_EMAIL_PORT, 587),
  secure: toBoolean(process.env.NOTIFICATION_SERVICE_EMAIL_SECURE, false),
  user: process.env.NOTIFICATION_SERVICE_EMAIL_USER ?? "",
  password: process.env.NOTIFICATION_SERVICE_EMAIL_PASSWORD ?? "",
  from: process.env.NOTIFICATION_SERVICE_EMAIL_FROM ?? "noreply@novels.app",
}));

export const pushConfig = registerAs("push", () => ({
  projectId: process.env.NOTIFICATION_SERVICE_FIREBASE_PROJECT_ID ?? "",
  clientEmail: process.env.NOTIFICATION_SERVICE_FIREBASE_CLIENT_EMAIL ?? "",
  privateKey: normalizePrivateKey(
    process.env.NOTIFICATION_SERVICE_FIREBASE_PRIVATE_KEY
  ),
}));

export const smsConfig = registerAs("sms", () => ({
  accountSid: process.env.NOTIFICATION_SERVICE_TWILIO_ACCOUNT_SID ?? "",
  authToken: process.env.NOTIFICATION_SERVICE_TWILIO_AUTH_TOKEN ?? "",
  from: process.env.NOTIFICATION_SERVICE_TWILIO_FROM ?? "",
}));

export const redisConfig = registerAs("redis", () => ({
  host: process.env.NOTIFICATION_SERVICE_REDIS_HOST ?? "localhost",
  port: toNumber(process.env.NOTIFICATION_SERVICE_REDIS_PORT, INFRASTRUCTURE_PORTS.REDIS),
  password: process.env.NOTIFICATION_SERVICE_REDIS_PASSWORD ?? undefined,
}));

