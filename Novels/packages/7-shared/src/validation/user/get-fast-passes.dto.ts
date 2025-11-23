// Get Fast Passes DTO

import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GetFastPassesDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsBoolean()
  @IsOptional()
  includeUsed?: boolean; // Include used fast passes
}

