// Synthesize Speech DTO

import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

export class SynthesizeSpeechDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsString()
  @IsOptional()
  voice?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.5)
  @Max(2.0)
  speed?: number;

  @IsString()
  @IsOptional()
  emotion?: string; // Emotion control string

  @IsEnum(['terrified', 'sad', 'shouting', 'whispering', 'cheerful', 'angry', 'neutral'])
  @IsOptional()
  voiceStyle?: 'terrified' | 'sad' | 'shouting' | 'whispering' | 'cheerful' | 'angry' | 'neutral';
}

