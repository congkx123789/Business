export interface RecommendationItemDto {
  storyId: number;
  title: string;
  reason: string;
  score: number;
}

export interface RecommendationResponseDto {
  success: boolean;
  data: RecommendationItemDto[];
  message: string;
}


