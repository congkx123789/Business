import { Injectable } from "@nestjs/common";
import { ReadingPreferences as ReadingPreferencesModel } from "@prisma/users-service-client";
import { DatabaseService } from "../../common/database/database.service";
import { UpdateReadingPreferencesDto } from "7-shared/validation/user/update-reading-preferences.dto";

type PageTurnDirection = "horizontal" | "vertical";
type ScrollBehavior = "smooth" | "instant" | "auto";

interface ReadingPreferencesPayload {
  fontSize: number;
  fontFamily: "system" | "serif" | "sans-serif" | "monospace" | "custom";
  customFontUrl?: string;
  customFontName?: string;
  customFontData?: string;
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  wordSpacing: number;
  textAlign: "left" | "center" | "justify";
  readingMode: "scroll" | "page";
  pageTurnDirection: PageTurnDirection;
  scrollBehavior: ScrollBehavior;
  backgroundColor: "white" | "black" | "sepia" | "eye-protection" | "custom";
  customBackgroundColor?: string;
  textColor: string;
  autoHideControls: boolean;
  tapToToggleControls: boolean;
  controlsTimeout: number;
  brightness: number;
  pageTurnAnimation: boolean;
  syncAcrossDevices: boolean;
  blueLightFilterEnabled: boolean;
  blueLightFilterStrength: number;
  blueLightFilterAdaptive: boolean;
  blueLightFilterScheduleStart?: string;
  blueLightFilterScheduleEnd?: string;
  preferredFormats: string[];
  formatProcessingPdfAutoCropMargins: boolean;
  formatProcessingPdfAutoGenerateTOC: boolean;
  formatProcessingDocxAutoGenerateTOC: boolean;
  formatProcessingArchiveReadFromZip: boolean;
  formatProcessingArchiveReadFromRar: boolean;
  marginHorizontal: number;
  marginVertical: number;
}

const ALLOWED_PREFERRED_FORMATS = ["epub", "pdf", "mobi", "fb2", "docx", "txt", "cbr", "cbz"] as const;
const ALLOWED_PREFERRED_FORMAT_SET = new Set<string>(ALLOWED_PREFERRED_FORMATS);

const DEFAULT_PREFERENCES: ReadingPreferencesPayload = {
  fontSize: 16,
  fontFamily: "system",
  customFontUrl: undefined,
  customFontName: undefined,
  customFontData: undefined,
  lineHeight: 1.5,
  letterSpacing: 0,
  paragraphSpacing: 1,
  wordSpacing: 0,
  textAlign: "left",
  readingMode: "scroll",
  pageTurnDirection: "horizontal",
  scrollBehavior: "smooth",
  backgroundColor: "white",
  customBackgroundColor: undefined,
  textColor: "#000000",
  autoHideControls: true,
  tapToToggleControls: true,
  controlsTimeout: 3000,
  brightness: 100,
  pageTurnAnimation: true,
  syncAcrossDevices: true,
  blueLightFilterEnabled: false,
  blueLightFilterStrength: 50,
  blueLightFilterAdaptive: true,
  blueLightFilterScheduleStart: undefined,
  blueLightFilterScheduleEnd: undefined,
  preferredFormats: [],
  formatProcessingPdfAutoCropMargins: true,
  formatProcessingPdfAutoGenerateTOC: true,
  formatProcessingDocxAutoGenerateTOC: true,
  formatProcessingArchiveReadFromZip: true,
  formatProcessingArchiveReadFromRar: true,
  marginHorizontal: 20,
  marginVertical: 20,
};

const SPECIAL_FIELD_MAP: Record<string, keyof ReadingPreferencesModel> = {
  pageTurnDirection: "readingModePageDirection",
  blueLightFilterScheduleStart: "blueLightFilterStart",
  blueLightFilterScheduleEnd: "blueLightFilterEnd",
};

const UPSERTABLE_DB_FIELDS = new Set<keyof ReadingPreferencesModel>([
  "fontSize",
  "fontFamily",
  "customFontUrl",
  "customFontName",
  "customFontData",
  "lineHeight",
  "letterSpacing",
  "paragraphSpacing",
  "wordSpacing",
  "textAlign",
  "readingMode",
  "readingModePageDirection",
  "scrollBehavior",
  "backgroundColor",
  "customBackgroundColor",
  "textColor",
  "autoHideControls",
  "tapToToggleControls",
  "controlsTimeout",
  "brightness",
  "pageTurnAnimation",
  "syncAcrossDevices",
  "blueLightFilterEnabled",
  "blueLightFilterStrength",
  "blueLightFilterAdaptive",
  "blueLightFilterStart",
  "blueLightFilterEnd",
  "preferredFormats",
  "formatProcessingPdfAutoCropMargins",
  "formatProcessingPdfAutoGenerateTOC",
  "formatProcessingDocxAutoGenerateTOC",
  "formatProcessingArchiveReadFromZip",
  "formatProcessingArchiveReadFromRar",
  "marginHorizontal",
  "marginVertical",
]);

@Injectable()
export class ReadingPreferencesService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  private sanitizePreferredFormats(formats?: string[]) {
    if (!Array.isArray(formats) || !formats.length) {
      return [];
    }

    const normalized: string[] = [];
    for (const value of formats) {
      if (typeof value !== "string") {
        continue;
      }
      const format = value.toLowerCase();
      if (ALLOWED_PREFERRED_FORMAT_SET.has(format) && !normalized.includes(format)) {
        normalized.push(format);
      }
    }

    return normalized;
  }

  private mapInputToDbPayload(input: Record<string, unknown>) {
    const payload: Partial<ReadingPreferencesModel> = {};

    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) {
        continue;
      }

      if (key === "preferredFormats") {
        payload.preferredFormats = this.sanitizePreferredFormats(value as string[]);
        continue;
      }

      const dbField = (SPECIAL_FIELD_MAP[key] as keyof ReadingPreferencesModel | undefined) ?? (key as keyof ReadingPreferencesModel);

      if (!UPSERTABLE_DB_FIELDS.has(dbField)) {
        continue;
      }

      payload[dbField] = value as never;
    }

    return payload;
  }

  private mapEntityToResponse(preferences?: ReadingPreferencesModel | null): ReadingPreferencesPayload {
    if (!preferences) {
      return {
        ...DEFAULT_PREFERENCES,
        preferredFormats: [...DEFAULT_PREFERENCES.preferredFormats],
      };
    }

    return {
      fontSize: preferences.fontSize,
      fontFamily: preferences.fontFamily as ReadingPreferencesPayload["fontFamily"],
      customFontUrl: preferences.customFontUrl ?? undefined,
      customFontName: preferences.customFontName ?? undefined,
      customFontData: preferences.customFontData ?? undefined,
      lineHeight: preferences.lineHeight,
      letterSpacing: preferences.letterSpacing,
      paragraphSpacing: preferences.paragraphSpacing,
      wordSpacing: preferences.wordSpacing,
      textAlign: preferences.textAlign as ReadingPreferencesPayload["textAlign"],
      readingMode: preferences.readingMode as ReadingPreferencesPayload["readingMode"],
      pageTurnDirection: preferences.readingModePageDirection as PageTurnDirection,
      scrollBehavior: preferences.scrollBehavior as ScrollBehavior,
      backgroundColor: preferences.backgroundColor as ReadingPreferencesPayload["backgroundColor"],
      customBackgroundColor: preferences.customBackgroundColor ?? undefined,
      textColor: preferences.textColor,
      autoHideControls: preferences.autoHideControls,
      tapToToggleControls: preferences.tapToToggleControls,
      controlsTimeout: preferences.controlsTimeout,
      brightness: preferences.brightness,
      pageTurnAnimation: preferences.pageTurnAnimation,
      syncAcrossDevices: preferences.syncAcrossDevices,
      blueLightFilterEnabled: preferences.blueLightFilterEnabled,
      blueLightFilterStrength: preferences.blueLightFilterStrength,
      blueLightFilterAdaptive: preferences.blueLightFilterAdaptive,
      blueLightFilterScheduleStart: preferences.blueLightFilterStart ?? undefined,
      blueLightFilterScheduleEnd: preferences.blueLightFilterEnd ?? undefined,
      preferredFormats: this.sanitizePreferredFormats(preferences.preferredFormats),
      formatProcessingPdfAutoCropMargins: preferences.formatProcessingPdfAutoCropMargins,
      formatProcessingPdfAutoGenerateTOC: preferences.formatProcessingPdfAutoGenerateTOC,
      formatProcessingDocxAutoGenerateTOC: preferences.formatProcessingDocxAutoGenerateTOC,
      formatProcessingArchiveReadFromZip: preferences.formatProcessingArchiveReadFromZip,
      formatProcessingArchiveReadFromRar: preferences.formatProcessingArchiveReadFromRar,
      marginHorizontal: preferences.marginHorizontal,
      marginVertical: preferences.marginVertical,
    };
  }

  async getPreferences(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const preferences = await this.prisma.readingPreferences.findUnique({
        where: { userId: normalizedUserId },
      });

      return {
        success: true,
        data: this.mapEntityToResponse(preferences),
        message: preferences ? "Reading preferences retrieved successfully" : "Using default reading preferences",
      };
    } catch (error) {
      return {
        success: true,
        data: this.mapEntityToResponse(),
        message: error instanceof Error ? error.message : "Using default reading preferences",
      };
    }
  }

  async updatePreferences(userId: string, dto: UpdateReadingPreferencesDto) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const updatePayload = this.mapInputToDbPayload(dto as Record<string, unknown>);

      await this.prisma.readingPreferences.upsert({
        where: { userId: normalizedUserId },
        update: updatePayload,
        create: {
          userId: normalizedUserId,
          ...this.mapInputToDbPayload(DEFAULT_PREFERENCES as Record<string, unknown>),
          ...updatePayload,
        },
      });

      const entity = await this.prisma.readingPreferences.findUnique({ where: { userId: normalizedUserId } });

      return {
        success: true,
        data: this.mapEntityToResponse(entity),
        message: "Reading preferences updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update preferences",
      };
    }
  }
}















