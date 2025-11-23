import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class ScheduleReadingDto {
  @IsString()
  @IsNotEmpty()
  groupId!: string;

  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsInt()
  @Min(1)
  chapterNumber!: number;

  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @IsOptional()
  @IsDateString()
  discussionDate?: string;
}


