// Reply to Paragraph Comment DTO

import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class ReplyToParagraphCommentDto {
  @IsString()
  @IsNotEmpty()
  commentId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsBoolean()
  isAuthorReply?: boolean;
}

