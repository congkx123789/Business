// Like Paragraph Comment DTO

import { IsBoolean, IsOptional, IsString, IsNotEmpty } from "class-validator";

export class LikeParagraphCommentDto {
  @IsString()
  @IsNotEmpty()
  commentId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsBoolean()
  isAuthor?: boolean;
}

