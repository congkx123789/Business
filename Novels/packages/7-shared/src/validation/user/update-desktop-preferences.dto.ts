// Update Desktop Preferences DTO

import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDesktopPreferencesDto {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  tabState?: {
    openTabs?: any[];
    activeTabId?: string;
    tabGroups?: any[];
  };

  @IsArray()
  @IsOptional()
  layoutPresets?: any[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  focusMode?: {
    enabled?: boolean;
    maxWidth?: number;
    alignment?: 'left' | 'center' | 'right';
    readingLineGuide?: boolean;
  };

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  splitViewState?: {
    leftChapterId?: string;
    rightChapterId?: string;
    splitPosition?: number;
    splitDirection?: 'horizontal' | 'vertical';
  };
}

