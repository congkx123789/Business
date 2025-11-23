import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class BatchDownloadDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  storyIds!: string[];

  @IsOptional()
  @IsBoolean()
  includePremium?: boolean;
}

