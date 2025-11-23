// Ranking Query DTO

import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RankingQueryDto {
  @IsEnum(['monthly-votes', 'recommendations', 'sales', 'popularity'])
  @IsOptional()
  rankingType?: 'monthly-votes' | 'recommendations' | 'sales' | 'popularity';

  @IsString()
  @IsOptional()
  genre?: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'all-time'])
  @IsOptional()
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

