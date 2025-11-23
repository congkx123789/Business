// Genre Stories Query DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';

export class GenreStoriesQueryDto {
  @IsString()
  @IsNotEmpty()
  genreId!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @IsEnum(['newest', 'popular', 'rating', 'updated'])
  @IsOptional()
  sort?: 'newest' | 'popular' | 'rating' | 'updated';

  @IsString()
  @IsOptional()
  filters?: string; // JSON string for additional filters
}

