import { BrowserWindow, Notification, dialog, ipcMain } from "electron";
import { promises as fs } from "node:fs";
import { CHANNELS } from "../shared/constants";
import type {
  FileDialogOptions,
  NotificationPayload,
  ReadFileRequest,
  WriteFileRequest
} from "../shared/types";

type WindowResolver = () => BrowserWindow | null;

const mapFileFilters = (options?: FileDialogOptions) =>
  options?.filters?.map((filter) => ({
    name: filter.name,
    extensions: filter.extensions
  }));

const toOpenDialogOptions = (options?: FileDialogOptions): Electron.OpenDialogOptions => {
  const properties: Electron.OpenDialogOptions["properties"] = ["dontAddToRecent"];

  if (options?.allowMultiple) {
    properties.push("multiSelections");
  }

  if (options?.pickDirectories) {
    properties.push("openDirectory");
  } else {
    properties.push("openFile");
  }

  if (options?.showHiddenFiles) {
    properties.push("showHiddenFiles");
  }

  return {
    title: options?.title,
    defaultPath: options?.defaultPath,
    filters: mapFileFilters(options),
    properties
  };
};

const toSaveDialogOptions = (options?: FileDialogOptions): Electron.SaveDialogOptions => ({
  title: options?.title,
  defaultPath: options?.defaultPath,
  filters: mapFileFilters(options),
  showsTagField: false
});

const normalizeWriteData = (request: WriteFileRequest) => {
  if (Buffer.isBuffer(request.data)) {
    return request.data;
  }

  if (request.encoding === "base64") {
    return Buffer.from(request.data, "base64");
  }

  return request.data;
};

const readFileWithEncoding = async (request: ReadFileRequest) => {
  const buffer = await fs.readFile(request.path);
  const encoding = request.encoding ?? "utf-8";

  if (encoding === "base64") {
    return buffer.toString("base64");
  }

  return buffer.toString(encoding);
};

export const registerNativeFeatureHandlers = (resolveWindow: WindowResolver) => {
  ipcMain.handle(CHANNELS.FILE.SHOW_OPEN_DIALOG, async (_event, options?: FileDialogOptions) => {
    const dialogOptions = toOpenDialogOptions(options);
    const browserWindow = resolveWindow();
    const result = browserWindow
      ? await dialog.showOpenDialog(browserWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);
    return {
      canceled: result.canceled,
      filePaths: result.filePaths
    };
  });

  ipcMain.handle(CHANNELS.FILE.SHOW_SAVE_DIALOG, async (_event, options?: FileDialogOptions) => {
    const dialogOptions = toSaveDialogOptions(options);
    const browserWindow = resolveWindow();
    const result = browserWindow
      ? await dialog.showSaveDialog(browserWindow, dialogOptions)
      : await dialog.showSaveDialog(dialogOptions);
    return {
      canceled: result.canceled,
      filePath: result.filePath ?? undefined
    };
  });

  ipcMain.handle(CHANNELS.FILE.READ_CONTENTS, async (_event, request: ReadFileRequest) => {
    try {
      return await readFileWithEncoding(request);
    } catch (error) {
      console.error("[native-features] Failed to read file:", error);
      throw error;
    }
  });

  ipcMain.handle(CHANNELS.FILE.WRITE_CONTENTS, async (_event, request: WriteFileRequest) => {
    try {
      const data = normalizeWriteData(request);
      await fs.writeFile(request.path, data, request.encoding && request.encoding !== "base64" && !Buffer.isBuffer(data) ? { encoding: request.encoding } : undefined);
      return true;
    } catch (error) {
      console.error("[native-features] Failed to write file:", error);
      throw error;
    }
  });

  ipcMain.handle(CHANNELS.NOTIFICATIONS.SHOW, (_event, payload: NotificationPayload) => {
    const notification = new Notification({
      title: payload.title,
      subtitle: payload.subtitle,
      body: payload.body,
      silent: payload.silent
    });
    notification.show();
    return true;
  });
};

