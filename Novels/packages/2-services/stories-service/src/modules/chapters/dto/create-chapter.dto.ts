import { IsNumber, IsString, IsOptional } from "class-validator";

export class CreateChapterDto {
  @IsNumber()
  storyId: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

