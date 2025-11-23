// Parallel Translation DTO

import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class ParallelTranslationDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  fromLang!: string;

  @IsString()
  @IsNotEmpty()
  toLang!: string;

  @IsEnum(['line-by-line', 'side-by-side', 'interleaved'])
  @IsOptional()
  displayMode?: 'line-by-line' | 'side-by-side' | 'interleaved';
}

