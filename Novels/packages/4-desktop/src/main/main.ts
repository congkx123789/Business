import { app, BrowserWindow } from "electron";
import { registerIpcHandlers } from "./ipc-handlers";
import { createTray } from "./system-tray";
import { configureMenu } from "./menu-manager";
import { setupAutoUpdater } from "./auto-updater";
import { createOrRestoreMainWindow, getMainWindow } from "./window-manager";
import { registerNativeFeatureHandlers } from "./native-features";
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from "./global-shortcuts";
import { flushPendingExternalOpens, registerFileHandlers } from "./file-handlers";
import { setupContextMenu } from "./context-menu";

const ensureSingleInstance = () => {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    process.exit(0);
  }

  app.on("second-instance", () => {
    const window = getMainWindow();
    if (!window) {
      return;
    }
    if (window.isMinimized()) {
      window.restore();
    }
    window.focus();
  });
};

const bootstrap = async () => {
  if (process.platform === "win32") {
    app.setAppUserModelId("StorySphere");
  }

  const window = await createOrRestoreMainWindow();
  flushPendingExternalOpens(getMainWindow);
  configureMenu(window);
  createTray(window);
  setupAutoUpdater(window);
  registerIpcHandlers(getMainWindow);
  registerGlobalShortcuts(getMainWindow);
};

ensureSingleInstance();
app.disableHardwareAcceleration();
setupContextMenu();
registerNativeFeatureHandlers(getMainWindow);
registerFileHandlers(getMainWindow);

app.whenReady().then(() => {
  bootstrap().catch((error) => {
    console.error("Failed to bootstrap desktop app", error);
    app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      bootstrap().catch((error) => {
        console.error("Failed to re-create window", error);
      });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  unregisterGlobalShortcuts();
});
