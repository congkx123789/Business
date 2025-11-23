import { IsNumber, IsOptional, IsString } from "class-validator";

export class GenreStoriesQueryDto {
  @IsNumber()
  genreId: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  filters?: Record<string, any>;
}

