import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetDownloadQueueDto {
  @IsOptional()
  @IsIn(['pending', 'in-progress', 'completed', 'failed'])
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  storyId?: string;
}

