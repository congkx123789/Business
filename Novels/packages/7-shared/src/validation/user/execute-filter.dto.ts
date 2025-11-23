import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterQueryDto } from './filter-query.dto';

export class ExecuteFilterDto {
  @ValidateNested()
  @Type(() => FilterQueryDto)
  query!: FilterQueryDto;
}

