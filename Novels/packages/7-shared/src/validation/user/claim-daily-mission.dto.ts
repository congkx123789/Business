// Claim Daily Mission DTO

import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimDailyMissionDto {
  @IsString()
  @IsNotEmpty()
  missionId!: string;
}

