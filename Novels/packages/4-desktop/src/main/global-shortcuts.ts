import { BrowserWindow, globalShortcut } from "electron";
import { CHANNELS } from "../shared/constants";

type WindowResolver = () => BrowserWindow | null;

const SHORTCUTS: Array<{ accelerator: string; channel: string }> = [
  {
    accelerator: "CommandOrControl+Shift+F",
    channel: CHANNELS.SHORTCUTS.FOCUS_MODE_TOGGLE
  },
  {
    accelerator: "MediaPlayPause",
    channel: CHANNELS.SHORTCUTS.MEDIA_TOGGLE
  }
];

let registered = false;

export const registerGlobalShortcuts = (resolveWindow: WindowResolver) => {
  if (registered) {
    globalShortcut.unregisterAll();
  }

  SHORTCUTS.forEach(({ accelerator, channel }) => {
    const success = globalShortcut.register(accelerator, () => {
      const window = resolveWindow();
      if (!window) {
        return;
      }
      window.webContents.send(channel);
    });

    if (!success) {
      console.warn(`[desktop] Failed to register global shortcut ${accelerator}`);
    }
  });

  registered = true;
};

export const unregisterGlobalShortcuts = () => {
  globalShortcut.unregisterAll();
  registered = false;
};

