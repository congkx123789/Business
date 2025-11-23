export const CHANNELS = {
  APP: {
    VERSION: "app/version",
    CHECK_UPDATES: "app/check-updates",
    UPDATE_AVAILABLE: "app/update-available"
  },
  WINDOW: {
    MINIMIZE: "window/minimize",
    MAXIMIZE: "window/maximize",
    RESTORE: "window/restore",
    CLOSE: "window/close"
  },
  FILE: {
    SHOW_OPEN_DIALOG: "file/show-open-dialog",
    SHOW_SAVE_DIALOG: "file/show-save-dialog",
    READ_CONTENTS: "file/read",
    WRITE_CONTENTS: "file/write",
    OPENED_EXTERNALLY: "file/opened-externally"
  },
  NOTIFICATIONS: {
    SHOW: "notifications/show"
  },
  SHORTCUTS: {
    FOCUS_MODE_TOGGLE: "shortcuts/focus-mode-toggle",
    MEDIA_TOGGLE: "shortcuts/media-toggle"
  }
} as const;
