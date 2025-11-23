import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReaderTabDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsOptional()
  @IsString()
  storyId?: string;

  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsNumber()
  scrollPosition?: number;
}

class TabGroupDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsString({ each: true })
  tabIds!: string[];
}

export class UpdateTabStateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReaderTabDto)
  tabs!: ReaderTabDto[];

  @IsOptional()
  @IsString()
  activeTabId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TabGroupDto)
  groups?: TabGroupDto[];
}

