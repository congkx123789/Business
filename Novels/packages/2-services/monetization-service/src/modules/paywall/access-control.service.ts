import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService } from "../../common/database/database.service";
import { CheckAccessDto, AccessDecision } from "./dto/check-access.dto";
import { PaywallConfigDto } from "./dto/paywall-config.dto";

const ACCESS_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const PAYWALL_CONFIG_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AccessControlService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getPaywallConfig(storyId: string): Promise<PaywallConfigDto> {
    const cacheKey = `paywall_config:${storyId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<PaywallConfigDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    let paywall = await this.databaseService.storyPaywall.findUnique({
      where: { storyId },
    });

    // Create default if not exists
    if (!paywall) {
      paywall = await this.databaseService.storyPaywall.create({
        data: {
          storyId,
          freeChapters: 100,
          isEnabled: true,
          previewLength: 500,
        },
      });
    }

    const config: PaywallConfigDto = {
      storyId: paywall.storyId,
      freeChapters: paywall.freeChapters,
      enabled: paywall.isEnabled,
      previewLength: paywall.previewLength,
      updatedAt: paywall.updatedAt.toISOString(),
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, config, PAYWALL_CONFIG_CACHE_TTL);
    return config;
  }

  async updatePaywallConfig(config: Omit<PaywallConfigDto, "updatedAt">): Promise<PaywallConfigDto> {
    const updated = await this.databaseService.storyPaywall.upsert({
      where: { storyId: config.storyId },
      create: {
        storyId: config.storyId,
        freeChapters: config.freeChapters,
        isEnabled: config.enabled,
        previewLength: config.previewLength,
      },
      update: {
        freeChapters: config.freeChapters,
        isEnabled: config.enabled,
        previewLength: config.previewLength,
      },
    });

    const result: PaywallConfigDto = {
      storyId: updated.storyId,
      freeChapters: updated.freeChapters,
      enabled: updated.isEnabled,
      previewLength: updated.previewLength,
      updatedAt: updated.updatedAt.toISOString(),
    };

    // Invalidate cache
    const cacheKey = `paywall_config:${config.storyId}`;
    await this.cacheManager.del(cacheKey);

    return result;
  }

  async resolveAccess(data: CheckAccessDto): Promise<AccessDecision> {
    const cacheKey = `access:${data.userId}:${data.chapterId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<AccessDecision>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check database for access record
    const accessRecord = await this.databaseService.chapterAccess.findUnique({
      where: {
        userId_chapterId: {
          userId: data.userId,
          chapterId: data.chapterId,
        },
      },
    });

    if (accessRecord) {
      // Check if expired
      if (accessRecord.expiresAt && new Date(accessRecord.expiresAt) < new Date()) {
        const decision: AccessDecision = { hasAccess: false, reason: "expired" };
        await this.cacheManager.set(cacheKey, decision, ACCESS_CACHE_TTL);
        return decision;
      }

      const decision: AccessDecision = {
        hasAccess: true,
        reason: accessRecord.accessType as any,
        expiresAt: accessRecord.expiresAt?.toISOString() ?? null,
      };
      
      await this.cacheManager.set(cacheKey, decision, ACCESS_CACHE_TTL);
      return decision;
    }

    // Check paywall config
    const config = await this.getPaywallConfig(data.storyId);
    if (!config.enabled) {
      const decision: AccessDecision = { hasAccess: true, reason: "free" };
      await this.cacheManager.set(cacheKey, decision, ACCESS_CACHE_TTL);
      return decision;
    }

    // Check if chapter is free
    const chapterNumber = data.chapterNumber ?? 1;
    if (chapterNumber <= config.freeChapters) {
      const decision: AccessDecision = { hasAccess: true, reason: "free" };
      await this.cacheManager.set(cacheKey, decision, ACCESS_CACHE_TTL);
      return decision;
    }

    const decision: AccessDecision = { hasAccess: false, reason: "paywall" };
    await this.cacheManager.set(cacheKey, decision, ACCESS_CACHE_TTL);
    return decision;
  }

  async grantAccess(data: {
    userId: string;
    chapterId: string;
    storyId: string;
    reason: "purchased" | "subscription" | "privilege" | "free";
    expiresAt?: string | null;
  }) {
    const accessRecord = await this.databaseService.chapterAccess.upsert({
      where: {
        userId_chapterId: {
          userId: data.userId,
          chapterId: data.chapterId,
        },
      },
      create: {
        userId: data.userId,
        chapterId: data.chapterId,
        storyId: data.storyId,
        accessType: data.reason,
        purchasedAt: data.reason === "purchased" ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      update: {
        accessType: data.reason,
        purchasedAt: data.reason === "purchased" ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    // Invalidate cache
    const cacheKey = `access:${data.userId}:${data.chapterId}`;
    await this.cacheManager.del(cacheKey);

    return {
      userId: accessRecord.userId,
      chapterId: accessRecord.chapterId,
      storyId: accessRecord.storyId,
      reason: accessRecord.accessType,
      grantedAt: accessRecord.createdAt.toISOString(),
      expiresAt: accessRecord.expiresAt?.toISOString() ?? null,
    };
  }
}


