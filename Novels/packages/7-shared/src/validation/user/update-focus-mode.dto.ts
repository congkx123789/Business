import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateFocusModeDto {
  @IsOptional()
  @IsInt()
  @Min(400)
  @Max(1600)
  maxWidth?: number;

  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  alignment?: 'left' | 'center' | 'right';

  @IsOptional()
  @IsBoolean()
  readingLineGuide?: boolean;
}

