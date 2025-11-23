// Generic Comment DTOs shared across services

import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @IsOptional()
  storyId?: string;

  @IsString()
  @IsOptional()
  chapterId?: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean;
}

export class CreateForumPostDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  storyId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;
}

export class MarkReviewHelpfulDto {
  @IsString()
  @IsNotEmpty()
  reviewId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

