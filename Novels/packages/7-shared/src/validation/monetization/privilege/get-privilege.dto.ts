// Get Privilege DTO

import { IsString, IsOptional } from 'class-validator';

export class GetPrivilegeDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  storyId?: string;
}

