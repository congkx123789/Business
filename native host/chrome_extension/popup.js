async function send(action, data = {}) {
  try {
    const res = await chrome.runtime.sendMessage({ action, data });
    return res;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

document.getElementById('btnPing').addEventListener('click', async () => {
  setStatus('Sending sample...');
  const res = await send('sample_task', { message: 'hello' });
  setStatus(res?.ok ? 'OK' : `Error: ${res?.error}`);
});

document.getElementById('btnLaunch').addEventListener('click', async () => {
  setStatus('Launching...');
  const exe_path = document.getElementById('exePath').value.trim();
  const args = document.getElementById('exeArgs').value.trim();
  const res = await send('app_launch', { exe_path, args: args || undefined });
  setStatus(res?.ok ? 'Launched' : `Error: ${res?.error}`);
});

document.getElementById('btnFocus').addEventListener('click', async () => {
  setStatus('Focusing...');
  const title = document.getElementById('winTitle').value.trim();
  const res = await send('app_focus', { title });
  setStatus(res?.ok ? 'Focused' : `Error: ${res?.error}`);
});

document.getElementById('btnKeys').addEventListener('click', async () => {
  setStatus('Sending keys...');
  const keys = document.getElementById('keys').value;
  const res = await send('app_send_keys', { keys });
  setStatus(res?.ok ? 'Done' : `Error: ${res?.error}`);
});

document.getElementById('btnMove').addEventListener('click', async () => {
  const x = Number(document.getElementById('curX').value);
  const y = Number(document.getElementById('curY').value);
  const res = await send('cursor_move', { x, y });
  setStatus(res?.ok ? 'Moved' : `Error: ${res?.error}`);
});

document.getElementById('btnGetPos').addEventListener('click', async () => {
  const res = await send('cursor_get_pos', {});
  if (res?.ok) setStatus(`x=${res.x}, y=${res.y}`); else setStatus(`Error: ${res?.error}`);
});

document.getElementById('btnScroll').addEventListener('click', async () => {
  const wheel_delta = Number(document.getElementById('wheelDelta').value);
  const xStr = document.getElementById('curX').value;
  const yStr = document.getElementById('curY').value;
  const x = xStr ? Number(xStr) : undefined;
  const y = yStr ? Number(yStr) : undefined;
  const res = await send('cursor_scroll', { wheel_delta, x, y });
  setStatus(res?.ok ? 'Scrolled' : `Error: ${res?.error}`);
});

document.getElementById('btnDrag').addEventListener('click', async () => {
  const from_x = Number(document.getElementById('fromX').value);
  const from_y = Number(document.getElementById('fromY').value);
  const to_x = Number(document.getElementById('toX').value);
  const to_y = Number(document.getElementById('toY').value);
  const button = document.getElementById('dragButton').value || 'left';
  const res = await send('cursor_drag', { from_x, from_y, to_x, to_y, button });
  setStatus(res?.ok ? 'Dragged' : `Error: ${res?.error}`);
});

document.getElementById('btnCtx').addEventListener('click', async () => {
  const res = await send('agent_cursor_context', {});
  if (res?.ok) {
    setStatus(`x=${res.x}, y=${res.y} | ${res.window_title || ''} ${res.control || ''}`);
  } else setStatus(`Error: ${res?.error}`);
});

document.getElementById('btnShot').addEventListener('click', async () => {
  setStatus('Capturing...');
  const width = Number(document.getElementById('shotW').value);
  const height = Number(document.getElementById('shotH').value);
  const res = await send('agent_cursor_screenshot', { width, height });
  if (res?.ok) {
    const img = document.getElementById('img');
    img.src = `data:image/png;base64,${res.image_base64}`;
    setStatus(`Screenshot ${res.width}x${res.height} at x=${res.x}, y=${res.y}`);
  } else setStatus(`Error: ${res?.error}`);
});


