import type { DesktopBridge } from "../shared/electron-api";

/**
 * Check if running in Electron environment
 */
export const isElectron = (): boolean => {
  return typeof window !== "undefined" && typeof window.electronAPI !== "undefined";
};

/**
 * Get the Electron API bridge if available
 */
const getBridge = (): DesktopBridge | null => {
  if (typeof window === "undefined") {
    return null;
  }
  if (window.electronAPI) {
    return window.electronAPI;
  }

  return window.storySphere?.desktop ?? null;
};

/**
 * Get the desktop bridge (Electron API)
 * Returns null if not running in Electron
 */
export const getDesktopBridge = (): DesktopBridge | null => {
  return getBridge();
};

/**
 * Get the update bridge
 * Returns null if not running in Electron
 */
export const getUpdateBridge = () => {
  const bridge = getBridge();
  return bridge?.updates || null;
};

/**
 * Get window controls
 * Returns null if not running in Electron
 */
export const getWindowControls = () => {
  const bridge = getBridge();
  return bridge?.window || null;
};

/**
 * Get file operations bridge
 * Returns null if not running in Electron
 */
export const getFileBridge = () => {
  const bridge = getBridge();
  return bridge?.files || null;
};

/**
 * Get notifications bridge
 * Returns null if not running in Electron
 */
export const getNotificationsBridge = () => {
  const bridge = getBridge();
  return bridge?.notifications || null;
};

/**
 * Get shortcuts bridge
 * Returns null if not running in Electron
 */
export const getShortcutsBridge = () => {
  const bridge = getBridge();
  return bridge?.shortcuts || null;
};

