import contextMenu from "electron-context-menu";
import type { BrowserWindow } from "electron";
import { shell } from "electron";

/**
 * Setup native context menu for the application
 * Provides right-click context menu with copy/paste/select all options
 */
export function setupContextMenu() {
  contextMenu({
    prepend: (
      _defaultActions: any,
      params: { selectionText?: string },
      _browserWindow?: BrowserWindow
    ) => [
      {
        label: "Search with Google",
        visible: params.selectionText?.trim().length ? params.selectionText.trim().length > 0 : false,
        click: () => {
          if (params.selectionText) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(params.selectionText)}`;
            shell.openExternal(searchUrl);
          }
        }
      },
      {
        type: "separator" as const
      }
    ],
    append: (
      _defaultActions: any,
      params: { x: number; y: number },
      browserWindow?: BrowserWindow
    ) => [
      {
        label: "Inspect Element",
        visible: process.env.NODE_ENV === "development",
        click: () => {
          if (browserWindow) {
            browserWindow.webContents.inspectElement(params.x, params.y);
          }
        }
      }
    ],
    showLookUpSelection: true,
    showSearchWithGoogle: true,
    showCopyImage: true,
    showCopyImageAddress: true,
    showSaveImage: true,
    showSaveImageAs: true,
    showSaveLinkAs: true,
    showInspectElement: process.env.NODE_ENV === "development"
  });
}

