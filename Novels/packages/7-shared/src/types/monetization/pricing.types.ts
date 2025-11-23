// Pricing types

export interface ChapterPrice {
  chapterId: string;
  characterCount: number;
  basePrice: number; // In points (3-5 points per 1000 characters)
  currentPrice: number; // After discounts
  discountPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingRule {
  id: string;
  storyId?: string; // Story-specific or global
  ruleType: 'character-based' | 'fixed' | 'tiered';
  pricePer1000: number; // For character-based (3-5 points)
  fixedPrice?: number; // For fixed pricing
  discountPercent?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

