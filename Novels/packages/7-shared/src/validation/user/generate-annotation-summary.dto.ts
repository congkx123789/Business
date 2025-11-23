// Generate Annotation Summary DTO

import { IsArray, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateAnnotationSummaryDto {
  @IsArray()
  @IsNotEmpty()
  annotationIds!: string[];

  @IsArray()
  @IsNotEmpty()
  highlights!: string[]; // Selected highlights to summarize

  @IsString()
  @IsOptional()
  context?: string; // Additional context for AI
}

