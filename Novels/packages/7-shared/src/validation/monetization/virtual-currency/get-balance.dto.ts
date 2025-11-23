// Get Balance DTO

import { IsString, IsOptional } from 'class-validator';

export class GetBalanceDto {
  @IsString()
  @IsOptional()
  userId?: string;
}

