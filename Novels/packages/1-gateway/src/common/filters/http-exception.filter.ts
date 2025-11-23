import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    // Structured logging (Rule #10 - Observability)
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === "string" ? message : (message as any).message || "Error",
      traceId: request.headers["x-trace-id"] || "unknown", // Trace ID propagation
    };

    // Log structured error (for Loki/Grafana)
    console.error(JSON.stringify({
      level: "error",
      ...errorResponse,
      error: exception instanceof Error ? exception.stack : String(exception),
    }));

    response.status(status).json(errorResponse);
  }
}
