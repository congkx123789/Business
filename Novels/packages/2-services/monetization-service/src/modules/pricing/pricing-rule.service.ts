import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService } from "../../common/database/database.service";
import { PricingRuleDto } from "./dto/pricing-rule.dto";

const GLOBAL_RULE_KEY = "__global__";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class PricingRuleService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getRule(storyId?: string): Promise<PricingRuleDto> {
    const cacheKey = `pricing_rule:${storyId ?? GLOBAL_RULE_KEY}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<PricingRuleDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const rule = await this.databaseService.pricingRule.findFirst({
      where: {
        storyId: storyId ?? null,
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (rule) {
      const dto: PricingRuleDto = {
        storyId: rule.storyId ?? undefined,
        pointsPerThousandChars: Number(rule.pricePer1000),
        minPrice: Number(rule.minPrice),
        maxPrice: Number(rule.maxPrice),
        discountPercent: Number(rule.discountPercent),
        updatedAt: rule.updatedAt.toISOString(),
      };
      
      // Cache the result
      await this.cacheManager.set(cacheKey, dto, CACHE_TTL);
      return dto;
    }

    // Default rule if none found
    const defaultRule: PricingRuleDto = {
      pointsPerThousandChars: 4,
      minPrice: 3,
      maxPrice: 120,
      discountPercent: 0,
      updatedAt: new Date().toISOString(),
    };

    // Cache default rule
    await this.cacheManager.set(cacheKey, defaultRule, CACHE_TTL);
    return defaultRule;
  }

  async listRules(storyId?: string): Promise<PricingRuleDto[]> {
    if (storyId) {
      return [await this.getRule(storyId)];
    }

    const rules = await this.databaseService.pricingRule.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return rules.map((rule) => ({
      storyId: rule.storyId ?? undefined,
      pointsPerThousandChars: Number(rule.pricePer1000),
      minPrice: Number(rule.minPrice),
      maxPrice: Number(rule.maxPrice),
      discountPercent: Number(rule.discountPercent),
      updatedAt: rule.updatedAt.toISOString(),
    }));
  }

  async upsertRule(rule: Omit<PricingRuleDto, "updatedAt">): Promise<PricingRuleDto> {
    const existing = await this.databaseService.pricingRule.findFirst({
      where: {
        storyId: rule.storyId ?? null,
      },
    });

    const ruleData = {
      storyId: rule.storyId ?? null,
      ruleType: "base_rate",
      pricePer1000: rule.pointsPerThousandChars,
      minPrice: rule.minPrice ?? 3,
      maxPrice: rule.maxPrice ?? 120,
      discountPercent: rule.discountPercent ?? 0,
      isActive: true,
    };

    let updatedRule;
    if (existing) {
      updatedRule = await this.databaseService.pricingRule.update({
        where: { id: existing.id },
        data: ruleData,
      });
    } else {
      updatedRule = await this.databaseService.pricingRule.create({
        data: ruleData,
      });
    }

    // Invalidate cache
    const cacheKey = `pricing_rule:${rule.storyId ?? GLOBAL_RULE_KEY}`;
    await this.cacheManager.del(cacheKey);

    return {
      storyId: updatedRule.storyId ?? undefined,
      pointsPerThousandChars: Number(updatedRule.pricePer1000),
      minPrice: Number(updatedRule.minPrice),
      maxPrice: Number(updatedRule.maxPrice),
      discountPercent: Number(updatedRule.discountPercent),
      updatedAt: updatedRule.updatedAt.toISOString(),
    };
  }
}


