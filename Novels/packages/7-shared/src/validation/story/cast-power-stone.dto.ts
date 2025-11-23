// Cast Power Stone DTO

import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CastPowerStoneDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  votes!: number; // Number of power stones to cast
}

