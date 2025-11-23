// Create Membership DTO

import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean; // Default: true
}

