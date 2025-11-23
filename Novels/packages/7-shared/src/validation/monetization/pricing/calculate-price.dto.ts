// Calculate Price DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CalculatePriceDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  characterCount?: number; // If not provided, will be fetched from chapter
}

