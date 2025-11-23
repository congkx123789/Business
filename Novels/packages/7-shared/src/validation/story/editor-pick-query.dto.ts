// Editor's Pick Query DTO

import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class EditorPickQueryDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @IsString()
  @IsOptional()
  genre?: string;
}

