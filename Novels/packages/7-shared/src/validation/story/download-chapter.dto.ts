// Download Chapter DTO

import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class DownloadChapterDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsEnum(['json', 'text', 'epub'])
  @IsOptional()
  format?: 'json' | 'text' | 'epub';
}

