import { IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateChapterDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

