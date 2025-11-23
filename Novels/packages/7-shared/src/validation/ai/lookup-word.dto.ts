// Lookup Word DTO

import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class LookupWordDto {
  @IsString()
  @IsNotEmpty()
  word!: string;

  @IsString()
  @IsNotEmpty()
  fromLang!: string;

  @IsString()
  @IsOptional()
  toLang?: string;

  @IsEnum(['default', 'abbyy', 'oxford', 'custom'])
  @IsOptional()
  dictionarySource?: 'default' | 'abbyy' | 'oxford' | 'custom';
}

