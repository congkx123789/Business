// Unify Annotations DTO

import { IsArray, IsNotEmpty, IsOptional, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnnotationItem {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  highlightColor?: string;
}

export class UnifyAnnotationsDto {
  @IsEnum(['epub', 'pdf', 'web', 'youtube', 'twitter', 'app'])
  @IsNotEmpty()
  sourceType!: 'epub' | 'pdf' | 'web' | 'youtube' | 'twitter' | 'app';

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnnotationItem)
  annotations!: AnnotationItem[];
}

