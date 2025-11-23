// Add to Library DTO

import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class AddToLibraryDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsArray()
  @IsOptional()
  customTags?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

