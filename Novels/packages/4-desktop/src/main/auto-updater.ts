import { BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";

export function setupAutoUpdater(window: BrowserWindow | null) {
  if (!window) {
    return;
  }

  // Only enable auto-updater in production
  if (process.env.NODE_ENV === "development") {
    return;
  }

  autoUpdater.autoDownload = true;

  autoUpdater.on("error", (error) => {
    console.error("[auto-updater] Error:", error);
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox(window, {
        type: "info",
        title: "Update ready",
        message: "A new version of StorySphere is ready to install.",
        buttons: ["Restart now", "Later"]
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      })
      .catch((error) => {
        console.error("[auto-updater] Failed to show update dialog:", error);
      });
  });
}
