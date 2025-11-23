import { IsNumber } from "class-validator";

export class WatermarkRequestDto {
  @IsNumber()
  chapterId!: number;

  @IsNumber()
  userId!: number;
}


