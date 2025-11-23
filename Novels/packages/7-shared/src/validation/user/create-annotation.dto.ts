// Create Annotation DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, IsEnum } from 'class-validator';

export class CreateAnnotationDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  selectedText!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paragraphIndex?: number;

  @IsString()
  @IsOptional()
  highlightColor?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(['epub', 'pdf', 'web', 'youtube', 'twitter', 'app'])
  @IsOptional()
  sourceType?: 'epub' | 'pdf' | 'web' | 'youtube' | 'twitter' | 'app';

  @IsBoolean()
  @IsOptional()
  revisitationQueue?: boolean;
}

