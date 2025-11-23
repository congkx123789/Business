import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterQueryDto } from './filter-query.dto';

export class CreateFilteredViewDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ValidateNested()
  @Type(() => FilterQueryDto)
  query!: FilterQueryDto;

  @IsOptional()
  @IsBoolean()
  isAutoUpdating?: boolean;
}

