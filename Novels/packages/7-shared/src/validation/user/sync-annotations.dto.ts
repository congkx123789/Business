import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SyncAnnotationsDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsOptional()
  @IsString()
  lastSyncedAt?: string;
}

