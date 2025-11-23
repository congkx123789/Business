// Example hook for sending a message via the background to the native host
window.addEventListener("automation:run", (e) => {
  const detail = e.detail || {};
  chrome.runtime.sendMessage({ action: detail.action, data: detail.data });
});

