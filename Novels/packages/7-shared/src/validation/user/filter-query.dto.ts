import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TagFilterDto {
  @IsIn(['AND', 'OR', 'NOT'])
  operator!: 'AND' | 'OR' | 'NOT';

  @IsArray()
  @IsString({ each: true })
  values!: string[];
}

class ProgressRangeDto {
  @IsNumber()
  min!: number;

  @IsNumber()
  max!: number;
}

class DateRangeDto {
  @IsIn(['addedAt', 'lastReadAt', 'completedAt'])
  field!: 'addedAt' | 'lastReadAt' | 'completedAt';

  @IsNumber()
  start!: number;

  @IsNumber()
  end!: number;
}

export class FilterQueryDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TagFilterDto)
  tags?: TagFilterDto;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  seriesId?: string;

  @IsOptional()
  @IsIn(['completed', 'in-progress', 'not-started'])
  completionStatus?: 'completed' | 'in-progress' | 'not-started';

  @IsOptional()
  @ValidateNested()
  @Type(() => ProgressRangeDto)
  progressRange?: ProgressRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsBoolean()
  hasHighlights?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBookmarks?: boolean;
}

