const NATIVE_HOST_NAME = "com.example.automation_bridge";

let port = null;

function connect() {
  if (port) return port;
  port = chrome.runtime.connectNative(NATIVE_HOST_NAME);
  port.onMessage.addListener((msg) => {
    console.log("Native message:", msg);
  });
  port.onDisconnect.addListener(() => {
    console.warn("Disconnected from native host", chrome.runtime.lastError);
    port = null;
  });
  return port;
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  try {
    const p = connect();
    p.postMessage({
      type: "automation_request",
      action: request.action,
      data: request.data ?? {}
    });
    sendResponse({ ok: true });
  } catch (err) {
    console.error("Failed to send to native host", err);
    sendResponse({ ok: false, error: String(err) });
  }
  return true;
});

