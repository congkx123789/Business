import { app, BrowserWindow, Menu, Tray, dialog, nativeImage } from "electron";
import { autoUpdater } from "electron-updater";
import { join } from "node:path";
import { CHANNELS } from "../shared/constants";

let tray: Tray | null = null;

const dispatchShortcut = (window: BrowserWindow, channel: string) => {
  if (!window || window.isDestroyed()) {
    return;
  }
  window.webContents.send(channel);
};

const handleManualUpdateCheck = async (window: BrowserWindow) => {
  if (!window || window.isDestroyed()) {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    await dialog.showMessageBox(window, {
      type: "info",
      title: "Updates disabled in development",
      message: "Manual update checks are only available in packaged builds."
    });
    return;
  }

  try {
    await autoUpdater.checkForUpdates();
    await dialog.showMessageBox(window, {
      type: "info",
      title: "Checking for updates",
      message: "We'll let you know if a new StorySphere desktop release is available."
    });
  } catch (error) {
    console.error("[system-tray] Failed to start manual update check:", error);
    await dialog.showMessageBox(window, {
      type: "error",
      title: "Update check failed",
      message: "We couldn't reach the update service. Please try again later."
    });
  }
};

export function createTray(window: BrowserWindow | null) {
  if (tray || !window) {
    return tray;
  }

  const iconPath = join(__dirname, "../../resources/icons/tray.png");
  const icon = nativeImage.createFromPath(iconPath);

  // Fallback to empty image if icon not found
  if (icon.isEmpty()) {
    console.warn("[system-tray] Tray icon not found at:", iconPath);
  }

  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip("StorySphere");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show",
        click: () => {
          window.show();
        }
      },
      {
        label: "Toggle Focus Mode",
        click: () => {
          dispatchShortcut(window, CHANNELS.SHORTCUTS.FOCUS_MODE_TOGGLE);
        }
      },
      {
        label: "Check for Updates",
        click: () => {
          void handleManualUpdateCheck(window);
        }
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        click: () => {
          app.quit();
        }
      }
    ])
  );

  tray.on("click", () => {
    window.isVisible() ? window.hide() : window.show();
  });

  return tray;
}

