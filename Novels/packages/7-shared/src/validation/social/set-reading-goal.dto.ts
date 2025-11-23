import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export enum ReadingGoalType {
  BOOKS = "books",
  CHAPTERS = "chapters",
  READING_TIME = "reading-time",
  PAGES = "pages",
}

export enum ReadingGoalRange {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

export class SetReadingGoalDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(ReadingGoalType)
  goalType!: ReadingGoalType;

  @IsInt()
  @Min(1)
  target!: number;

  @IsEnum(ReadingGoalRange)
  timeRange!: ReadingGoalRange;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}


