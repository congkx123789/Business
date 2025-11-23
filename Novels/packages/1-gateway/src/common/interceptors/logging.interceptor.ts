import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

type HeaderValue = string | string[] | undefined;
type HttpRequest = Request & { headers: Record<string, HeaderValue> };

const normalizeHeader = (value: HeaderValue): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const getErrorDetails = (error: unknown) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message ?? "Unknown error";
    const status = (error as { status?: number }).status ?? 500;
    return { message, status };
  }

  if (typeof error === "string") {
    return { message: error, status: 500 };
  }

  return { message: "Unknown error", status: 500 };
};

const ensureTraceId = (request: HttpRequest): string => {
  const header = normalizeHeader(request.headers["x-trace-id"]);
  const existingTraceId = header ?? (typeof request.get === "function" ? request.get("x-trace-id") : undefined);
  const traceId = existingTraceId ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  request.headers["x-trace-id"] = traceId;
  return traceId;
};

const logInfo = (payload: Record<string, unknown>) => {
  console.log(JSON.stringify(payload));
};

const logError = (payload: Record<string, unknown>) => {
  console.error(JSON.stringify(payload));
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<HttpRequest>();
    const { method, url, ip } = request;
    const traceId = ensureTraceId(request);
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          logInfo({
            level: "info",
            traceId,
            method,
            url,
            ip,
            statusCode: 200,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const { message, status } = getErrorDetails(error);
          logError({
            level: "error",
            traceId,
            method,
            url,
            ip,
            statusCode: status,
            duration: `${duration}ms`,
            error: message,
            timestamp: new Date().toISOString(),
          });
        },
      })
    );
  }
}
