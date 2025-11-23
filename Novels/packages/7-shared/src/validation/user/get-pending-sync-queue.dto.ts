import { IsNotEmpty, IsString } from 'class-validator';

export class GetPendingSyncQueueDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}

