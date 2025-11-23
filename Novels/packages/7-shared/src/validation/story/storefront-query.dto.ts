// Storefront Homepage Query DTO

import { IsString, IsOptional } from 'class-validator';

export class StorefrontQueryDto {
  @IsString()
  @IsOptional()
  userId?: string; // For personalization
}

