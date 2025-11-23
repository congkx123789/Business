import { BrowserWindow, app, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { CHANNELS } from "../shared/constants";

type WindowResolver = () => BrowserWindow | null;

const withWindow = (resolve: WindowResolver, callback: (window: BrowserWindow) => void) => {
  const window = resolve();
  if (window) {
    callback(window);
  }
};

export function registerIpcHandlers(resolveWindow: WindowResolver) {
  ipcMain.handle(CHANNELS.APP.VERSION, () => app.getVersion());

  ipcMain.handle(CHANNELS.APP.CHECK_UPDATES, async () => {
    try {
      // Only check for updates in production
      if (process.env.NODE_ENV === "development") {
        return null;
      }
      const result = await autoUpdater.checkForUpdates();
      return result?.updateInfo ?? null;
    } catch (error) {
      console.error("[ipc-handlers] Failed to check for updates:", error);
      return null;
    }
  });

  ipcMain.on(CHANNELS.WINDOW.MINIMIZE, () => {
    withWindow(resolveWindow, (window) => window.minimize());
  });

  ipcMain.on(CHANNELS.WINDOW.MAXIMIZE, () => {
    withWindow(resolveWindow, (window) => {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    });
  });

  ipcMain.on(CHANNELS.WINDOW.RESTORE, () => {
    withWindow(resolveWindow, (window) => {
      if (window.isMinimized()) {
        window.restore();
      } else if (!window.isFocused()) {
        window.focus();
      }
    });
  });

  ipcMain.on(CHANNELS.WINDOW.CLOSE, () => {
    withWindow(resolveWindow, (window) => window.close());
  });

  // Only register update listener in production
  if (process.env.NODE_ENV !== "development") {
    autoUpdater.on("update-available", (info) => {
      withWindow(resolveWindow, (window) => {
        if (window && !window.isDestroyed()) {
          window.webContents.send(CHANNELS.APP.UPDATE_AVAILABLE, info);
        }
      });
    });
  }
}
