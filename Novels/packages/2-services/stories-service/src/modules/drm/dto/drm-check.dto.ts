import { IsNumber } from "class-validator";

export class DrmCheckDto {
  @IsNumber()
  chapterId!: number;

  @IsNumber()
  userId!: number;
}


