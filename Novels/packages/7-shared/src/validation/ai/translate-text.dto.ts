// Translate Text DTO

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TranslateTextDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  fromLang!: string;

  @IsString()
  @IsNotEmpty()
  toLang!: string;

  @IsString()
  @IsOptional()
  context?: string; // Story/chapter context for better translation
}

