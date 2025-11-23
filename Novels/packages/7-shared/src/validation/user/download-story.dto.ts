import { IsBoolean, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class DownloadStoryDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @IsOptional()
  @IsBoolean()
  includePremium?: boolean;
}

