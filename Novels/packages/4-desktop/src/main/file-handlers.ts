import { app, BrowserWindow } from "electron";
import { parse } from "node:url";
import { CHANNELS } from "../shared/constants";
import type { ExternalOpenPayload } from "../shared/types";

type WindowResolver = () => BrowserWindow | null;

const pendingPayloads: ExternalOpenPayload[] = [];

const sendToRenderer = (resolveWindow: WindowResolver, payload: ExternalOpenPayload) => {
  const window = resolveWindow();
  if (window) {
    window.webContents.send(CHANNELS.FILE.OPENED_EXTERNALLY, payload);
    return;
  }

  pendingPayloads.push(payload);
};

export const flushPendingExternalOpens = (resolveWindow: WindowResolver) => {
  while (pendingPayloads.length) {
    const payload = pendingPayloads.shift();
    if (payload) {
      sendToRenderer(resolveWindow, payload);
    }
  }
};

const handleDeepLinkArgument = (resolveWindow: WindowResolver, rawArg: string) => {
  if (rawArg.startsWith("novel://")) {
    sendToRenderer(resolveWindow, { type: "url", url: rawArg });
    return;
  }

  if (rawArg.endsWith(".novel") || rawArg.endsWith(".json") || rawArg.endsWith(".storysphere")) {
    sendToRenderer(resolveWindow, { type: "file", path: rawArg });
  }
};

const registerOpenFileHandler = (resolveWindow: WindowResolver) => {
  app.on("open-file", (event, path) => {
    event.preventDefault();
    sendToRenderer(resolveWindow, { type: "file", path });
  });
};

const registerOpenUrlHandler = (resolveWindow: WindowResolver) => {
  app.on("open-url", (event, url) => {
    event.preventDefault();
    const parsed = parse(url);
    if (!parsed.protocol) {
      return;
    }
    sendToRenderer(resolveWindow, { type: "url", url });
  });
};

const registerProtocolClient = () => {
  const protocol = "novel";

  if (process.platform === "win32") {
    app.setAsDefaultProtocolClient(protocol, process.execPath, [process.argv[1]]);
    return;
  }

  if (process.platform === "darwin") {
    app.setAsDefaultProtocolClient(protocol);
    return;
  }

  if (process.platform === "linux") {
    app.setAsDefaultProtocolClient(protocol);
  }
};

export const registerFileHandlers = (resolveWindow: WindowResolver) => {
  registerOpenFileHandler(resolveWindow);
  registerOpenUrlHandler(resolveWindow);

  if (app.isReady()) {
    registerProtocolClient();
  } else {
    app.once("ready", registerProtocolClient);
  }

  // Process argv for Windows/Linux when app launched via protocol/file
  if (process.platform !== "darwin") {
    process.argv.slice(1).forEach((arg) => handleDeepLinkArgument(resolveWindow, arg));
  }
};

