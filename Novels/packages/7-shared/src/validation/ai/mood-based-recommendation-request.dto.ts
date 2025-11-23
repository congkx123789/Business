// Mood-Based Recommendation Request DTO

import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator';

export class MoodBasedRecommendationRequestDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(['action', 'romance', 'mystery', 'comedy', 'drama', 'thriller', 'fantasy', 'sci-fi', 'horror', 'slice-of-life'])
  @IsNotEmpty()
  mood!: 'action' | 'romance' | 'mystery' | 'comedy' | 'drama' | 'thriller' | 'fantasy' | 'sci-fi' | 'horror' | 'slice-of-life';

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;
}

