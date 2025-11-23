import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class UpsertBookmarkDto {
  @IsInt()
  bookId!: number;

  @IsOptional()
  @IsInt()
  chapterId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}
