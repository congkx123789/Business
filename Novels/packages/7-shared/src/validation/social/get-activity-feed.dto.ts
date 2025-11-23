import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class GetActivityFeedDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}


