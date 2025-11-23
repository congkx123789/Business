export interface CalculatePriceRequestDto {
  chapterId: string;
  storyId?: string;
  characterCount?: number;
}

export interface CalculatePriceResponseDto {
  chapterId: string;
  storyId?: string;
  characterCount: number;
  price: number;
  pointsPerThousandChars: number;
  minPrice: number;
  maxPrice: number;
  calculatedAt: string;
}


