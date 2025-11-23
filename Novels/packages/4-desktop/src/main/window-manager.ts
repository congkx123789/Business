import { BrowserWindow, nativeImage } from "electron";
import windowStateKeeper from "electron-window-state";
import { join } from "node:path";

const isDev = process.env.NODE_ENV === "development";
const DEV_SERVER_URL = process.env.ELECTRON_START_URL ?? "http://localhost:3000";

const DEFAULT_DIMENSIONS = {
  width: 1280,
  height: 768
};

let mainWindow: BrowserWindow | null = null;
let windowState: ReturnType<typeof windowStateKeeper> | null = null;

const resolveIconPath = () => {
  const iconRelativePath = join(__dirname, "../../resources/icons/icon.png");
  const icon = nativeImage.createFromPath(iconRelativePath);
  
  // Fallback to empty image if icon not found
  if (icon.isEmpty()) {
    console.warn("[window-manager] Window icon not found at:", iconRelativePath);
    return nativeImage.createEmpty();
  }
  
  return icon;
};

const resolveWindowState = () => {
  if (!windowState) {
    windowState = windowStateKeeper({
      defaultWidth: DEFAULT_DIMENSIONS.width,
      defaultHeight: DEFAULT_DIMENSIONS.height,
      maximize: false,
      fullScreen: false
    });
  }
  return windowState;
};

const createBrowserWindow = () => {
  const state = resolveWindowState();

  const window = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width ?? DEFAULT_DIMENSIONS.width,
    height: state.height ?? DEFAULT_DIMENSIONS.height,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#0f172a",
    show: false,
    title: "StorySphere",
    icon: resolveIconPath(),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  });

  if (state.isMaximized) {
    window.maximize();
  }

  state.manage(window);
  return window;
};

const loadRendererContent = async (window: BrowserWindow) => {
  if (isDev) {
    try {
      await window.loadURL(DEV_SERVER_URL);
      window.webContents.openDevTools({ mode: "detach" });
    } catch (error) {
      console.error("[window-manager] Failed to load dev server:", error);
      console.error("[window-manager] Make sure the web app is running on", DEV_SERVER_URL);
      // Fallback to production HTML
      await window.loadFile(join(__dirname, "../renderer/index.html"));
    }
  } else {
    try {
      await window.loadFile(join(__dirname, "../renderer/index.html"));
    } catch (error) {
      console.error("[window-manager] Failed to load production HTML:", error);
      // Show error page
      await window.loadURL(`data:text/html,<html><body><h1>Failed to load application</h1><p>${error}</p></body></html>`);
    }
  }
};

export const createOrRestoreMainWindow = async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = createBrowserWindow();

  // Handle webContents errors
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("[window-manager] Failed to load content:", errorCode, errorDescription);
  });

  mainWindow.webContents.on("crashed", () => {
    console.error("[window-manager] Renderer process crashed");
  });

  await loadRendererContent(mainWindow);

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
};

export const getMainWindow = () => mainWindow;

