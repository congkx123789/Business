// Create Paragraph Comment DTO (Duanping)

import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min, IsIn } from "class-validator";

const PARAGRAPH_REACTIONS = ["like", "laugh", "cry", "angry", "wow", "love"] as const;

export class CreateParagraphCommentDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsNumber()
  @Min(0)
  paragraphIndex!: number;

  @IsString()
  @IsNotEmpty()
  paragraphText!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsIn(PARAGRAPH_REACTIONS)
  reactionType?: (typeof PARAGRAPH_REACTIONS)[number];
}

export class UpdateParagraphCommentDto {
  @IsString()
  @IsNotEmpty()
  commentId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsIn(PARAGRAPH_REACTIONS)
  reactionType?: (typeof PARAGRAPH_REACTIONS)[number];
}

