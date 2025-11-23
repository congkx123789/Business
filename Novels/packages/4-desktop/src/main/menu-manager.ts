import { BrowserWindow, Menu, shell } from "electron";
import { autoUpdater } from "electron-updater";

const DOCS_URL = "https://docs.storysphere.com/desktop";
const FEATURE_SYNC_URL = "https://docs.storysphere.com/feature-sync-map";
const SUPPORT_URL = "https://support.storysphere.com/contact";

const openExternalLink = async (target: string) => {
  try {
    await shell.openExternal(target);
  } catch (error) {
    console.error("[menu-manager] Failed to open external link:", target, error);
  }
};

const handleHelpUpdateCheck = async (window: BrowserWindow | null) => {
  if (!window || window.isDestroyed()) {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    await window.webContents.executeJavaScript(
      "console.info('Update checks are disabled in development builds.')"
    );
    return;
  }

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error("[menu-manager] Manual update check failed:", error);
  }
};

export function configureMenu(window: BrowserWindow | null) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        { role: "quit" }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    },
    {
      role: "help",
      label: "Help",
      submenu: [
        {
          label: "Desktop Documentation",
          click: () => {
            void openExternalLink(DOCS_URL);
          }
        },
        {
          label: "Feature Sync Map",
          click: () => {
            void openExternalLink(FEATURE_SYNC_URL);
          }
        },
        {
          type: "separator"
        },
        {
          label: "Check for Updates",
          click: () => {
            void handleHelpUpdateCheck(window);
          }
        },
        {
          label: "Report an Issue",
          click: () => {
            void openExternalLink(SUPPORT_URL);
          }
        }
      ]
    }
  ];

  // macOS-specific menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: "StorySphere",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    });

    // Update Window menu for macOS
    const windowMenu = template.find((item) => item.label === "Window");
    if (windowMenu && "submenu" in windowMenu) {
      (windowMenu.submenu as Electron.MenuItemConstructorOptions[]).push(
        { type: "separator" },
        { role: "front" }
      );
    }
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (window) {
    window.setMenu(menu);
  }
}

