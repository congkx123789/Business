import { IsBoolean, IsOptional } from 'class-validator';

export class GetStorageUsageDto {
  @IsOptional()
  @IsBoolean()
  includeBreakdown?: boolean;
}

