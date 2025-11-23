// Create Reading Challenge DTO

import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Min, IsInt } from "class-validator";

export class CreateReadingChallengeDto {
  @IsString()
  @IsNotEmpty()
  creatorId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(["personal", "community"])
  challengeType!: "personal" | "community";

  @IsInt()
  @Min(1)
  goal!: number;

  @IsEnum(["books", "chapters", "reading-time", "pages"])
  goalType!: "books" | "chapters" | "reading-time" | "pages";

  @IsEnum(["daily", "weekly", "monthly", "yearly", "custom"])
  timeRange!: "daily" | "weekly" | "monthly" | "yearly" | "custom";

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

