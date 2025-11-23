import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown cache error";
};

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    const cacheEnabled = this.configService.get<boolean>("cache.enable", false);
    if (!cacheEnabled || method !== "GET") {
      return next.handle();
    }

    const cacheKey = `gateway:${method}:${url}:${JSON.stringify(request.query)}`;

    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData !== undefined && cachedData !== null) {
        return of(cachedData);
      }
    } catch (error) {
      console.warn("Cache read error:", getErrorMessage(error));
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const ttl = this.configService.get<number>("cache.ttl", 60);
          await this.cacheManager.set(cacheKey, data, ttl * 1000);
        } catch (error) {
          console.warn("Cache set error:", getErrorMessage(error));
        }
      })
    );
  }
}
