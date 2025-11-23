import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

type HttpRequest = Request & { headers: Record<string, string | string[] | undefined> };

/**
 * Middleware to generate and propagate trace ID
 * Rule #10 - Observability: Propagate traceId from Gateway to all services
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: HttpRequest, res: Response, next: NextFunction) {
    const traceId =
      req.headers["x-trace-id"] as string ||
      `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    req.headers["x-trace-id"] = traceId;
    res.set("X-Trace-Id", traceId);

    next();
  }
}

