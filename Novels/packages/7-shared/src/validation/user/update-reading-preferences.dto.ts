// Update Reading Preferences DTO

import { IsNumber, IsString, IsBoolean, IsOptional, IsArray, Min, Max, IsIn, IsHexColor, IsInt, IsMilitaryTime } from "class-validator";

const FONT_FAMILIES = ["system", "serif", "sans-serif", "monospace", "custom"] as const;
const BACKGROUND_MODES = ["white", "black", "sepia", "eye-protection", "custom"] as const;
const READING_MODES = ["scroll", "page"] as const;
const PAGE_DIRECTIONS = ["horizontal", "vertical"] as const;
const SCROLL_BEHAVIORS = ["smooth", "instant", "auto"] as const;
const TEXT_ALIGNMENTS = ["left", "center", "justify"] as const;
const PREFERRED_FORMATS = ["epub", "pdf", "mobi", "fb2", "docx", "txt", "cbr", "cbz"] as const;

export class UpdateReadingPreferencesDto {
  @IsNumber()
  @IsOptional()
  @Min(12)
  @Max(24)
  fontSize?: number;

  @IsIn(FONT_FAMILIES)
  @IsOptional()
  fontFamily?: (typeof FONT_FAMILIES)[number];

  @IsString()
  @IsOptional()
  customFontUrl?: string;

  @IsString()
  @IsOptional()
  customFontName?: string;

  @IsString()
  @IsOptional()
  customFontData?: string;

  @IsNumber()
  @IsOptional()
  @Min(1.0)
  @Max(2.5)
  lineHeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(-0.5)
  @Max(2)
  letterSpacing?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  paragraphSpacing?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  wordSpacing?: number;

  @IsIn(TEXT_ALIGNMENTS)
  @IsOptional()
  textAlign?: (typeof TEXT_ALIGNMENTS)[number];

  @IsIn(READING_MODES)
  @IsOptional()
  readingMode?: (typeof READING_MODES)[number];

  @IsIn(PAGE_DIRECTIONS)
  @IsOptional()
  pageTurnDirection?: (typeof PAGE_DIRECTIONS)[number];

  @IsIn(SCROLL_BEHAVIORS)
  @IsOptional()
  scrollBehavior?: (typeof SCROLL_BEHAVIORS)[number];

  @IsIn(BACKGROUND_MODES)
  @IsOptional()
  backgroundColor?: (typeof BACKGROUND_MODES)[number];

  @IsHexColor()
  @IsOptional()
  customBackgroundColor?: string;

  @IsHexColor()
  @IsOptional()
  textColor?: string;

  @IsBoolean()
  @IsOptional()
  autoHideControls?: boolean;

  @IsBoolean()
  @IsOptional()
  tapToToggleControls?: boolean;

  @IsInt()
  @IsOptional()
  @Min(500)
  @Max(10000)
  controlsTimeout?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  brightness?: number;

  @IsBoolean()
  @IsOptional()
  pageTurnAnimation?: boolean;

  @IsBoolean()
  @IsOptional()
  syncAcrossDevices?: boolean;

  @IsBoolean()
  @IsOptional()
  blueLightFilterEnabled?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  blueLightFilterStrength?: number;

  @IsBoolean()
  @IsOptional()
  blueLightFilterAdaptive?: boolean;

  @IsMilitaryTime()
  @IsOptional()
  blueLightFilterScheduleStart?: string;

  @IsMilitaryTime()
  @IsOptional()
  blueLightFilterScheduleEnd?: string;

  @IsBoolean()
  @IsOptional()
  formatProcessingPdfAutoCropMargins?: boolean;

  @IsBoolean()
  @IsOptional()
  formatProcessingPdfAutoGenerateTOC?: boolean;

  @IsBoolean()
  @IsOptional()
  formatProcessingDocxAutoGenerateTOC?: boolean;

  @IsBoolean()
  @IsOptional()
  formatProcessingArchiveReadFromZip?: boolean;

  @IsBoolean()
  @IsOptional()
  formatProcessingArchiveReadFromRar?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(PREFERRED_FORMATS, { each: true })
  preferredFormats?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  marginHorizontal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  marginVertical?: number;
}

