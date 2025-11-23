import type { UpdateInfo } from "electron-updater";
import type {
  ExternalOpenPayload,
  FileDialogOptions,
  FileDialogResult,
  NotificationPayload,
  ReadFileRequest,
  SaveDialogResult,
  WriteFileRequest
} from "./types";

type UpdateAvailableListener = (info: UpdateInfo) => void;
type ShortcutListener = () => void;
type ExternalOpenListener = (payload: ExternalOpenPayload) => void;

export interface UpdatesBridge {
  version(): Promise<string>;
  check(): Promise<UpdateInfo | null>;
  onAvailable(listener: UpdateAvailableListener): () => void;
}

export interface WindowControlsBridge {
  minimize(): void;
  maximize(): void;
  restore(): void;
  close(): void;
}

export interface FilesBridge {
  openDialog(options?: FileDialogOptions): Promise<FileDialogResult>;
  saveDialog(options?: FileDialogOptions): Promise<SaveDialogResult>;
  read(request: ReadFileRequest): Promise<string>;
  write(request: WriteFileRequest): Promise<boolean>;
  onExternalOpen(listener: ExternalOpenListener): () => void;
}

export interface NotificationsBridge {
  show(payload: NotificationPayload): void;
}

export interface ShortcutsBridge {
  onFocusModeToggle(listener: ShortcutListener): () => void;
  onMediaToggle(listener: ShortcutListener): () => void;
}

export interface DesktopBridge {
  updates: UpdatesBridge;
  window: WindowControlsBridge;
  files: FilesBridge;
  notifications: NotificationsBridge;
  shortcuts: ShortcutsBridge;
}

declare global {
interface StorySphereDesktopNamespace {
    desktop?: DesktopBridge;
  }

  interface Window {
    electronAPI?: DesktopBridge;
    storySphere?: StorySphereDesktopNamespace;
  }
}

export {};

