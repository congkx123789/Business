// Export Annotations DTO

import { IsArray, IsOptional, IsEnum } from 'class-validator';

export class ExportAnnotationsDto {
  @IsArray()
  @IsOptional()
  annotationIds?: string[]; // If empty, export all

  @IsEnum(['epub', 'pdf', 'web', 'youtube', 'twitter', 'app'])
  @IsOptional()
  sourceType?: 'epub' | 'pdf' | 'web' | 'youtube' | 'twitter' | 'app';

  @IsEnum(['markdown', 'notion', 'obsidian', 'capacities', 'pdf'])
  @IsOptional()
  format?: 'markdown' | 'notion' | 'obsidian' | 'capacities' | 'pdf';
}

