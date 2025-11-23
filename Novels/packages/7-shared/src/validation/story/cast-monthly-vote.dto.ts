// Cast Monthly Vote DTO

import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CastMonthlyVoteDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsInt()
  @Min(1)
  votes!: number; // Number of monthly votes to cast

  @IsOptional()
  @IsInt()
  @Min(0)
  bonusVotes?: number;
}

