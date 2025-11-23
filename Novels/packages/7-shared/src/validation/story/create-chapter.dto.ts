// Create Chapter DTO

import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  chapterNumber?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}

