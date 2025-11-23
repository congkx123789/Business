// Get Daily Missions DTO

import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GetDailyMissionsDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsDateString()
  @IsOptional()
  date?: string; // YYYY-MM-DD format
}

