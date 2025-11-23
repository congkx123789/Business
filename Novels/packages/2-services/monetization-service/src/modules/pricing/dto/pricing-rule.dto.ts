export interface PricingRuleDto {
  storyId?: string;
  pointsPerThousandChars: number;
  minPrice: number;
  maxPrice: number;
  discountPercent?: number;
  updatedAt: string;
}


