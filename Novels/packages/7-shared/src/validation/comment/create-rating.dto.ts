// Create Rating DTO

import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating!: number; // 1-5 stars

  @IsString()
  @IsOptional()
  review?: string;
}

