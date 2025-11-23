// Claim Daily Bonus DTO

import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimDailyBonusDto {
  @IsString()
  @IsNotEmpty()
  membershipId!: string;
}

