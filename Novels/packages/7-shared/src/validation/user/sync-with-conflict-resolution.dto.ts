// Sync with Conflict Resolution DTO

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncWithConflictResolutionDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Object)
  localData!: {
    readingProgress?: any[];
    bookmarks?: any[];
    annotations?: any[];
    library?: any[];
  };

  @IsEnum(['last-write-wins', 'server-wins', 'client-wins', 'merge'])
  @IsOptional()
  conflictStrategy?: 'last-write-wins' | 'server-wins' | 'client-wins' | 'merge';
}

