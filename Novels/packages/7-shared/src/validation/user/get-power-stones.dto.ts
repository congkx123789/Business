// Get Power Stones DTO

import { IsString, IsOptional } from 'class-validator';

export class GetPowerStonesDto {
  @IsString()
  @IsOptional()
  userId?: string;
}

