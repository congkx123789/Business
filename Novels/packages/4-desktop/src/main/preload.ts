import { contextBridge, ipcRenderer } from "electron";
import type { UpdateInfo } from "electron-updater";
import { CHANNELS } from "../shared/constants";
import type { DesktopBridge } from "../shared/electron-api";
import type {
  ExternalOpenPayload,
  FileDialogOptions,
  NotificationPayload,
  ReadFileRequest,
  WriteFileRequest,
} from "../shared/types";

const subscribeWithCleanup = <T>(
  channel: string,
  listener: (payload: T) => void
): (() => void) => {
  const handler = (_event: Electron.IpcRendererEvent, payload: T) => listener(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

const api: DesktopBridge = {
  updates: {
    version: () => ipcRenderer.invoke(CHANNELS.APP.VERSION),
    check: () => ipcRenderer.invoke(CHANNELS.APP.CHECK_UPDATES),
    onAvailable: (listener) => subscribeWithCleanup<UpdateInfo>(CHANNELS.APP.UPDATE_AVAILABLE, listener)
  },
  window: {
    minimize: () => ipcRenderer.send(CHANNELS.WINDOW.MINIMIZE),
    maximize: () => ipcRenderer.send(CHANNELS.WINDOW.MAXIMIZE),
    restore: () => ipcRenderer.send(CHANNELS.WINDOW.RESTORE),
    close: () => ipcRenderer.send(CHANNELS.WINDOW.CLOSE)
  },
  files: {
    openDialog: (options?: FileDialogOptions) =>
      ipcRenderer.invoke(CHANNELS.FILE.SHOW_OPEN_DIALOG, options),
    saveDialog: (options?: FileDialogOptions) =>
      ipcRenderer.invoke(CHANNELS.FILE.SHOW_SAVE_DIALOG, options),
    read: (request: ReadFileRequest) => ipcRenderer.invoke(CHANNELS.FILE.READ_CONTENTS, request),
    write: (request: WriteFileRequest) => ipcRenderer.invoke(CHANNELS.FILE.WRITE_CONTENTS, request),
    onExternalOpen: (listener) =>
      subscribeWithCleanup<ExternalOpenPayload>(CHANNELS.FILE.OPENED_EXTERNALLY, listener)
  },
  notifications: {
    show: (payload: NotificationPayload) => {
      void ipcRenderer.invoke(CHANNELS.NOTIFICATIONS.SHOW, payload);
    }
  },
  shortcuts: {
    onFocusModeToggle: (listener) => subscribeWithCleanup<void>(CHANNELS.SHORTCUTS.FOCUS_MODE_TOGGLE, listener),
    onMediaToggle: (listener) => subscribeWithCleanup<void>(CHANNELS.SHORTCUTS.MEDIA_TOGGLE, listener)
  }
};

contextBridge.exposeInMainWorld("electronAPI", api);

/**
 * Temporary compatibility alias: expose the desktop bridge under window.storySphere.desktop
 * so older renderer code that hasn't migrated to window.electronAPI keeps working.
 */
const storySphereBridge = {
  ...(window.storySphere ?? {}),
  desktop: api
};

contextBridge.exposeInMainWorld("storySphere", storySphereBridge);
