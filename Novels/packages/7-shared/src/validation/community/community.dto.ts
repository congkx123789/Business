import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// Platform Interactions ------------------------------------------------------

export class CreatePollDto {
  @IsOptional()
  @IsString()
  storyId?: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  question!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  options!: string[];

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class VotePollDto {
  @IsString()
  @IsNotEmpty()
  pollId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  optionId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  optionIndex?: number;
}

class QuizQuestionDto {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsInt()
  @Min(0)
  answerIndex!: number;
}

export class CreateQuizDto {
  @IsOptional()
  @IsString()
  storyId?: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions!: QuizQuestionDto[];
}

export class SubmitQuizAnswersDto {
  @IsString()
  @IsNotEmpty()
  quizId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  answers!: number[];
}

// Fan Economy ----------------------------------------------------------------

export class CreateTipDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  authorId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

const RANKING_TYPES = ["story", "author", "all-time", "monthly"] as const;
const RANKING_WINDOWS = ["all-time", "monthly", "weekly"] as const;

export class GetFanRankingsDto {
  @IsOptional()
  @IsString()
  storyId?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsString()
  @IsIn(RANKING_TYPES)
  type!: (typeof RANKING_TYPES)[number];

  @IsString()
  @IsIn(RANKING_WINDOWS)
  timeRange!: (typeof RANKING_WINDOWS)[number];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CalculateBonusVotesDto {
  @IsNumber()
  @IsPositive()
  tipAmount!: number;
}

export class CreateQADto {
  @IsString()
  @IsNotEmpty()
  authorId!: string;

  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreateAuthorUpdateDto {
  @IsString()
  @IsNotEmpty()
  authorId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}


