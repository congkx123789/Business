/**
 * Type declarations for electron-context-menu
 * This package doesn't ship with TypeScript types
 */

declare module "electron-context-menu" {
  import type { BrowserWindow } from "electron";

  interface ContextMenuParams {
    x: number;
    y: number;
    selectionText?: string;
    linkURL?: string;
    linkText?: string;
    mediaType?: "image" | "video" | "audio";
    srcURL?: string;
    hasImageContents?: boolean;
    isEditable?: boolean;
  }

  interface ContextMenuAction {
    label?: string;
    role?: string;
    type?: "separator" | "normal";
    visible?: boolean;
    enabled?: boolean;
    click?: () => void;
  }

  interface ContextMenuOptions {
    prepend?: (
      defaultActions: ContextMenuAction[],
      params: ContextMenuParams,
      browserWindow?: BrowserWindow
    ) => ContextMenuAction[];
    append?: (
      defaultActions: ContextMenuAction[],
      params: ContextMenuParams,
      browserWindow?: BrowserWindow
    ) => ContextMenuAction[];
    showLookUpSelection?: boolean;
    showSearchWithGoogle?: boolean;
    showCopyImage?: boolean;
    showCopyImageAddress?: boolean;
    showSaveImage?: boolean;
    showSaveImageAs?: boolean;
    showSaveLinkAs?: boolean;
    showInspectElement?: boolean;
  }

  function contextMenu(options?: ContextMenuOptions): void;

  export = contextMenu;
}

