// Use Fast Pass DTO

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UseFastPassDto {
  @IsString()
  @IsNotEmpty()
  fastPassId!: string;

  @IsString()
  @IsOptional()
  chapterId?: string; // Optional: specific chapter to unlock
}

