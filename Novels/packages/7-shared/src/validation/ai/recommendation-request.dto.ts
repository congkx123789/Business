// Recommendation Request DTO

import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';

export class RecommendationRequestDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @IsEnum(['home', 'story', 'chapter', 'library'])
  @IsOptional()
  context?: 'home' | 'story' | 'chapter' | 'library';

  @IsEnum(['action', 'romance', 'mystery', 'comedy', 'drama', 'thriller', 'fantasy', 'sci-fi', 'horror', 'slice-of-life'])
  @IsOptional()
  mood?: 'action' | 'romance' | 'mystery' | 'comedy' | 'drama' | 'thriller' | 'fantasy' | 'sci-fi' | 'horror' | 'slice-of-life';
}

