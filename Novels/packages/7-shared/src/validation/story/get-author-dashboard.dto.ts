// Get Author Dashboard DTO

import { IsString, IsOptional } from 'class-validator';

export class GetAuthorDashboardDto {
  @IsString()
  @IsOptional()
  authorId?: string;

  @IsString()
  @IsOptional()
  storyId?: string;
}

