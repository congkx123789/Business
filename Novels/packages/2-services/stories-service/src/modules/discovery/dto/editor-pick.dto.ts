import { IsNumber, IsOptional, IsString, IsDateString } from "class-validator";

export class EditorPickDto {
  @IsNumber()
  storyId: number;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsDateString()
  featuredUntil?: string;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

