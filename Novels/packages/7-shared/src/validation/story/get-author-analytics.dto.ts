// Get Author Analytics DTO

import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class GetAuthorAnalyticsDto {
  @IsString()
  @IsOptional()
  authorId?: string;

  @IsString()
  @IsOptional()
  storyId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'all-time'])
  @IsOptional()
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

