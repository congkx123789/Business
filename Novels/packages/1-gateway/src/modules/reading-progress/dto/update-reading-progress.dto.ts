import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateReadingProgressDto {
  @IsOptional()
  @IsInt()
  chapterId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsString()
  lastPosition?: string;
}
