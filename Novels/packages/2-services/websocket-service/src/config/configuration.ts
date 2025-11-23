import { registerAs } from "@nestjs/config";
import { GRPC_PORTS, SERVICE_PORTS } from "7-shared";

type Convertible<T> = T | string | undefined;

const toNumber = (value: Convertible<number>, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig = registerAs("app", () => ({
  port: toNumber(process.env.WEBSOCKET_SERVICE_PORT, SERVICE_PORTS.WEBSOCKET_SERVICE),
  corsOrigin: process.env.WEBSOCKET_SERVICE_CORS_ORIGIN ?? "*",
  grpcUrl:
    process.env.WEBSOCKET_SERVICE_GRPC_URL ?? `0.0.0.0:${GRPC_PORTS.WEBSOCKET_SERVICE}`,
}));

