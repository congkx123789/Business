// Persistent connection to native host
const HOST_NAME = 'com.my_company.social_analyzer';

let port = null;

function connect() {
  try {
    port = chrome.runtime.connectNative(HOST_NAME);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);

    console.log('[NativeMessaging] Connected');

    // Send a sample message
    sendNativeMessage({
      command: 'analyze_text',
      payload: {
        text: 'Great post! Make $5,000 a week from home! https://short.ly/xYz'
      }
    });
  } catch (e) {
    console.error('[NativeMessaging] Connect error', e);
  }
}

function onNativeMessage(message) {
  console.log('[NativeMessaging] Received:', message);
}

function onDisconnected() {
  const lastError = chrome.runtime.lastError?.message;
  console.warn('[NativeMessaging] Disconnected', lastError || '');
  // Optional: backoff and reconnect
}

function sendNativeMessage(message) {
  if (!port) {
    console.warn('[NativeMessaging] No port, cannot send');
    return;
  }
  try {
    port.postMessage(message);
  } catch (e) {
    console.error('[NativeMessaging] Send error', e);
  }
}

// Startup
connect();


