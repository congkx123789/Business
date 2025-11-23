import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { RedisCacheService } from "../../cache/redis-cache.service";

@Injectable()
export class TranslationCacheService {
  constructor(private readonly cache: RedisCacheService) {}

  private buildKey(text: string, fromLang: string, toLang: string, context?: string) {
    const hash = createHash("sha1").update(`${fromLang}:${toLang}:${context ?? ""}:${text}`).digest("hex");
    return `translation:${hash}`;
  }

  async getOrSet<T>(
    text: string,
    fromLang: string,
    toLang: string,
    context: string | undefined,
    factory: () => Promise<T>
  ): Promise<T> {
    const key = this.buildKey(text, fromLang, toLang, context);
    // Translation cache TTL: 7 days (as per documentation)
    const ttlMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return this.cache.wrap(key, factory, ttlMs);
  }
}


