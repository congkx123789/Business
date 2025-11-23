import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SyncOperationDto {
  @IsIn(['create', 'update', 'delete'])
  operationType!: 'create' | 'update' | 'delete';

  @IsString()
  @IsNotEmpty()
  entity!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}

export class ProcessSyncQueueDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations!: SyncOperationDto[];
}

