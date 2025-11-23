import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/users-service-client";
import { DatabaseService } from "../../common/database/database.service";

interface UpdateDesktopPreferencesPayload {
  userId: string;
  tabState?: Prisma.InputJsonValue;
  layoutPreferences?: Prisma.InputJsonValue;
  focusModeSettings?: Prisma.InputJsonValue;
  keyboardShortcuts?: Prisma.InputJsonValue;
  splitViewState?: Prisma.InputJsonValue;
  savedFilters?: Prisma.InputJsonValue;
  exportHistory?: Prisma.InputJsonValue;
}

const DEFAULT_DESKTOP_STATE = {
  tabState: {},
  layoutPreferences: {},
  focusModeSettings: { enabled: false },
  keyboardShortcuts: {},
  splitViewState: { enabled: false },
  savedFilters: {},
  exportHistory: [],
};

@Injectable()
export class DesktopPreferencesService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async getDesktopPreferences(userId: string) {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const preferences = await this.prisma.desktopPreferences.findUnique({
        where: { userId: normalizedUserId },
      });

      if (!preferences) {
        return {
          success: true,
          data: DEFAULT_DESKTOP_STATE,
          message: "Using default desktop preferences",
        };
      }

      return {
        success: true,
        data: {
          tabState: preferences.tabState ?? DEFAULT_DESKTOP_STATE.tabState,
          layoutPreferences: preferences.layoutPreferences ?? DEFAULT_DESKTOP_STATE.layoutPreferences,
          focusModeSettings: preferences.focusModeSettings ?? DEFAULT_DESKTOP_STATE.focusModeSettings,
          keyboardShortcuts: preferences.keyboardShortcuts ?? DEFAULT_DESKTOP_STATE.keyboardShortcuts,
          splitViewState: preferences.splitViewState ?? DEFAULT_DESKTOP_STATE.splitViewState,
          savedFilters: preferences.savedFilters ?? DEFAULT_DESKTOP_STATE.savedFilters,
          exportHistory: preferences.exportHistory ?? DEFAULT_DESKTOP_STATE.exportHistory,
        },
        message: "Desktop preferences retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: DEFAULT_DESKTOP_STATE,
        message: error instanceof Error ? error.message : "Failed to load desktop preferences",
      };
    }
  }

  async updateDesktopPreferences(payload: UpdateDesktopPreferencesPayload) {
    try {
      const normalizedUserId = this.normalizeUserId(payload.userId);
      await this.prisma.desktopPreferences.upsert({
        where: { userId: normalizedUserId },
        update: {
          tabState: payload.tabState ?? undefined,
          layoutPreferences: payload.layoutPreferences ?? undefined,
          focusModeSettings: payload.focusModeSettings ?? undefined,
          keyboardShortcuts: payload.keyboardShortcuts ?? undefined,
          splitViewState: payload.splitViewState ?? undefined,
          savedFilters: payload.savedFilters ?? undefined,
          exportHistory: payload.exportHistory ?? undefined,
        },
        create: {
          userId: normalizedUserId,
          tabState: payload.tabState,
          layoutPreferences: payload.layoutPreferences,
          focusModeSettings: payload.focusModeSettings,
          keyboardShortcuts: payload.keyboardShortcuts,
          splitViewState: payload.splitViewState,
          savedFilters: payload.savedFilters,
          exportHistory: payload.exportHistory,
        },
      });

      return this.getDesktopPreferences(payload.userId);
    } catch (error) {
      return {
        success: false,
        data: DEFAULT_DESKTOP_STATE,
        message: error instanceof Error ? error.message : "Failed to update desktop preferences",
      };
    }
  }

  async updateFocusMode(userId: string, focusModeSettings: Prisma.InputJsonValue) {
    return this.updateDesktopPreferences({
      userId,
      focusModeSettings,
    });
  }

  async updateKeyboardShortcuts(userId: string, keyboardShortcuts: Prisma.InputJsonValue) {
    return this.updateDesktopPreferences({
      userId,
      keyboardShortcuts,
    });
  }
}
