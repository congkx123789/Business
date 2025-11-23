import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";

@Controller()
export class HealthController {
  @Get()
  @Public()
  health() {
    return {
      status: "ok",
      message: "API Gateway is running",
      timestamp: new Date().toISOString(),
      endpoints: {
        rest: "/api",
        graphql: "/graphql",
        books: "/api/books",
        categories: "/api/categories",
      },
    };
  }

  @Get("health")
  @Public()
  healthCheck() {
    return {
      status: "ok",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
    };
  }
}

