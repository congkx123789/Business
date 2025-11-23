// Update Story DTO

import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class UpdateStoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  author?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  genreId?: string;

  @IsEnum(['ongoing', 'completed', 'hiatus'])
  @IsOptional()
  status?: 'ongoing' | 'completed' | 'hiatus';
}

