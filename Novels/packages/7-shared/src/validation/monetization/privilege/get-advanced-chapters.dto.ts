// Get Advanced Chapters DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class GetAdvancedChaptersDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}

