import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SyncBookmarksDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsOptional()
  @IsString()
  lastSyncedAt?: string;
}

