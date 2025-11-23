// Create Chapter Comment DTO

import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class CreateChapterCommentDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string; // For nested comments
}

export class ReplyChapterCommentDto {
  @IsString()
  @IsNotEmpty()
  parentCommentId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}

