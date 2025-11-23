import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateLayoutPreferencesDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  layoutPresetId?: string;

  @IsOptional()
  @IsBoolean()
  splitViewEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  splitPosition?: number;

  @IsOptional()
  @IsBoolean()
  multiWindowEnabled?: boolean;
}

