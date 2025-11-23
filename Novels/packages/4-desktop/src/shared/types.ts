export interface DesktopPreferences {
  windowBounds: {
    width: number;
    height: number;
  };
  theme: "system" | "light" | "dark";
}

export type FileDialogFilter = {
  name: string;
  extensions: string[];
};

export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileDialogFilter[];
  allowMultiple?: boolean;
  pickDirectories?: boolean;
  showHiddenFiles?: boolean;
}

export interface FileDialogResult {
  canceled: boolean;
  filePaths: string[];
}

export interface SaveDialogResult {
  canceled: boolean;
  filePath?: string;
}

export interface ReadFileRequest {
  path: string;
  encoding?: BufferEncoding | "base64";
}

export interface WriteFileRequest {
  path: string;
  data: string | Buffer;
  encoding?: BufferEncoding | "base64";
}

export interface NotificationPayload {
  title: string;
  body: string;
  silent?: boolean;
  subtitle?: string;
}

export type ExternalOpenPayload =
  | {
      type: "file";
      path: string;
    }
  | {
      type: "url";
      url: string;
    };
