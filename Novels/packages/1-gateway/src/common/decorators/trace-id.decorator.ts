import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Decorator to extract trace ID from request headers
 * Used for distributed tracing (Rule #10 - Observability)
 */
export const TraceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers["x-trace-id"] || "unknown";
  }
);

