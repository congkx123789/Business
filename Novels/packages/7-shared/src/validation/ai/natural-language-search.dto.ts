// Natural Language Search DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class NaturalLanguageSearchDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  query!: string; // Natural language query like "sci-fi with advanced AI and ethical issues"

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;
}

