import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext, GqlContextType } from "@nestjs/graphql";

/**
 * Decorator to extract the current user from the request
 * Usage: @CurrentUser() user: User
 * 
 * The user is set by JwtAuthGuard after JWT validation
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // REST/HTTP context
    if (ctx.getType() === "http") {
      const request = ctx.switchToHttp().getRequest();
      return request?.user;
    }

    // GraphQL context
    if (ctx.getType<GqlContextType>() === "graphql") {
      const gqlContext = GqlExecutionContext.create(ctx);
      return gqlContext.getContext()?.req?.user;
    }

    return null;
  }
);

