import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService } from "../../common/database/database.service";
import { CalculatePriceRequestDto, CalculatePriceResponseDto } from "./dto/calculate-price.dto";
import { PricingRuleService } from "./pricing-rule.service";
import { PricingRuleDto } from "./dto/pricing-rule.dto";

const PRICE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class PricingService {
  constructor(
    private readonly pricingRuleService: PricingRuleService,
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async calculateChapterPrice(
    request: CalculatePriceRequestDto
  ): Promise<CalculatePriceResponseDto> {
    const cacheKey = `chapter_price:${request.chapterId}`;
    
    // Try cache first
    const cached = await this.cacheManager.get<CalculatePriceResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if price exists in database
    let chapterPrice = await this.databaseService.chapterPrice.findUnique({
      where: { chapterId: request.chapterId },
    });

    // If not in DB or character count changed, calculate and save
    if (!chapterPrice || (request.characterCount && chapterPrice.characterCount !== request.characterCount)) {
      const rule = await this.pricingRuleService.getRule(request.storyId);
      const characterCount = request.characterCount ?? chapterPrice?.characterCount ?? 5_000;
      const rawPrice = Math.ceil((characterCount / 1000) * rule.pointsPerThousandChars);
      const price = this.applyBounds(rawPrice, rule);

      const priceData = {
        chapterId: request.chapterId,
        storyId: request.storyId ?? "",
        characterCount,
        basePrice: price,
        currentPrice: price,
        pricePer1000: rule.pointsPerThousandChars,
        discount: rule.discountPercent ?? 0,
      };

      chapterPrice = await this.databaseService.chapterPrice.upsert({
        where: { chapterId: request.chapterId },
        create: priceData,
        update: priceData,
      });
    }

    const response: CalculatePriceResponseDto = {
      chapterId: request.chapterId,
      storyId: chapterPrice.storyId,
      characterCount: chapterPrice.characterCount,
      price: Number(chapterPrice.currentPrice),
      pointsPerThousandChars: Number(chapterPrice.pricePer1000),
      minPrice: 0, // Will be set from rule if needed
      maxPrice: 0, // Will be set from rule if needed
      calculatedAt: chapterPrice.calculatedAt.toISOString(),
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, response, PRICE_CACHE_TTL);
    return response;
  }

  async calculateBulkPrice(chapterIds: string[], storyId?: string) {
    const calculations = await Promise.all(
      chapterIds.map((chapterId) => this.calculateChapterPrice({ chapterId, storyId }))
    );

    return {
      totalPrice: calculations.reduce((sum, item) => sum + item.price, 0),
      breakdown: calculations,
    };
  }

  async getPricingRules(storyId?: string): Promise<PricingRuleDto[]> {
    return this.pricingRuleService.listRules(storyId);
  }

  async updatePricingRule(rule: {
    storyId?: string;
    pointsPerThousandChars: number;
    minPrice?: number;
    maxPrice?: number;
    discountPercent?: number;
  }) {
    const nextRule = await this.pricingRuleService.upsertRule({
      ...rule,
      minPrice: rule.minPrice ?? 3,
      maxPrice: rule.maxPrice ?? 120,
    });
    return nextRule;
  }

  private applyBounds(price: number, rule: PricingRuleDto) {
    if (price < rule.minPrice) {
      return rule.minPrice;
    }

    if (price > rule.maxPrice) {
      return rule.maxPrice;
    }

    if (rule.discountPercent && rule.discountPercent > 0) {
      return Math.max(rule.minPrice, Math.floor(price * (1 - rule.discountPercent / 100)));
    }

    return price;
  }
}

