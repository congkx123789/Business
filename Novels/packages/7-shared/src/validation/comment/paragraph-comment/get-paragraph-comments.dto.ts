// Get Paragraph Comments DTO

import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

const COMMENT_SORTS = ["newest", "oldest", "most-liked"] as const;

export class GetParagraphCommentsDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paragraphIndex?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(COMMENT_SORTS)
  sortBy?: (typeof COMMENT_SORTS)[number];
}

