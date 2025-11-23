// Update Reading Progress DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, IsDateString } from 'class-validator';

export class UpdateReadingProgressDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  paragraphIndex!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  scrollPosition?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  readingTime?: number; // seconds

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

