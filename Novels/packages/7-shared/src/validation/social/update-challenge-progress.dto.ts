import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class UpdateChallengeProgressDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsNumber()
  @Min(0)
  progress!: number;
}


