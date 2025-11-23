// Create Bookmark DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paragraphIndex?: number;

  @IsString()
  @IsOptional()
  note?: string;
}

