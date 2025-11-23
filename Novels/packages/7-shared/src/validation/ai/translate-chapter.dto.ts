// Translate Chapter DTO

import { IsString, IsNotEmpty } from 'class-validator';

export class TranslateChapterDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  fromLang!: string;

  @IsString()
  @IsNotEmpty()
  toLang!: string;
}

