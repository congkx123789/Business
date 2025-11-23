from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Dict, Any, List

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse

from main import load_config, run
from task_manager import task_manager

app = FastAPI()
executor = ThreadPoolExecutor(max_workers=8)

RECENT_LIMIT = 20


def render_index(accounts: List[dict]) -> str:
    options = []
    for acc in accounts:
        name = acc.get("name", "")
        options.append(
            f"<label style=display:block;margin:2px 0;><input type=checkbox name=accounts value=\"{name}\"> {name}</label>"
        )
    options_html = "\n".join(options)

    return f"""
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Browser Controller</title>
        <style>
          body {{ font-family: Arial, sans-serif; margin: 24px; }}
          fieldset {{ margin-bottom: 16px; }}
          .row {{ margin: 8px 0; }}
          button {{ padding: 6px 12px; cursor: pointer; }}
          textarea {{ width: 100%; max-width: 520px; height: 110px; }}
          #tasks {{ margin-top: 24px; }}
          .task {{ border: 1px solid #ccc; padding: 12px; margin-bottom: 12px; border-radius: 6px; }}
          .task h4 {{ margin: 0 0 6px 0; }}
          .events {{ font-family: monospace; font-size: 13px; max-height: 160px; overflow-y: auto; background: #fafafa; padding: 6px; border: 1px solid #eee; }}
        </style>
      </head>
      <body>
        <h2>Browser Controller</h2>
        <form method=post action="/start">
          <fieldset>
            <legend>Accounts</legend>
            {options_html}
          </fieldset>
          <fieldset>
            <legend>Mode</legend>
            <label><input type=radio name=mode value=run checked> Normal Run</label>
            <label style="margin-left:16px;"><input type=radio name=mode value=test_ip> Test IP</label>
          </fieldset>
          <fieldset>
            <legend>Targets</legend>
            <p>输入目标 URL（每行一个）。留空则使用默认页面或测试 IP。</p>
            <textarea name=targets placeholder="https://example.com/\nhttps://news.ycombinator.com/"></textarea>
          </fieldset>
          <div class=row>
            <label>Tabs per account: <input type=number name=tabs min=1 max=10 value=1></label>
          </div>
          <div class=row>
            <label><input type=checkbox name=headless> Headless</label>
          </div>
          <div class=row>
            <button type=submit>Start Selected</button>
            <button type=submit name=all value=1 style="margin-left:8px;">Start All</button>
          </div>
        </form>
        <section id="tasks">
          <h3>Recent Tasks</h3>
          <div id="task-list">Loading...</div>
        </section>
        <script>
          async function fetchTasks() {{
            try {{
              const res = await fetch('/status');
              if (!res.ok) return;
              const data = await res.json();
              const container = document.getElementById('task-list');
              if (!data.recent || data.recent.length === 0) {{
                container.innerHTML = '<p>No tasks yet</p>';
                return;
              }}
              container.innerHTML = data.recent.map(renderTask).join('');
            }} catch (err) {{
              console.error(err);
            }}
          }}

          function renderTask(task) {{
            const meta = task.meta;
            const status = task.status;
            const events = (task.events || []).slice(-10);
            const created = new Date(task.created_at * 1000).toLocaleString();
            const updated = new Date(task.updated_at * 1000).toLocaleString();
            const accounts = (meta.accounts || []).join(', ');
            const targets = Array.isArray(meta.targets) ? meta.targets.join('\\n') : meta.targets;
            const eventHtml = events.map(ev => '[' + new Date(ev.timestamp * 1000).toLocaleTimeString() + '] ' + JSON.stringify(ev)).join('\\n');
            return `
              <div class="task">
                <h4>Task ${{task.id.substring(0, 6)}} — status: ${{status}}</h4>
                <div>Mode: ${{meta.mode}} | Headless: ${{meta.headless}} | Tabs: ${{meta.tabs}}</div>
                <div>Accounts: ${{accounts}}</div>
                <div>Targets:<pre style="margin:4px 0; white-space:pre-wrap;">${{targets || 'default'}}</pre></div>
                <div>Created: ${{created}} | Updated: ${{updated}}</div>
                <div class="events">${{eventHtml || 'No events yet'}}</div>
              </div>`;
          }}

          fetchTasks();
          setInterval(fetchTasks, 4000);
        </script>
      </body>
    </html>
    """


@app.get("/", response_class=HTMLResponse)
def index() -> HTMLResponse:
    cfg = load_config()
    accounts = cfg.get("accounts", [])
    return HTMLResponse(render_index(accounts))


def _task_callback(task_id: str, event: Dict[str, Any]) -> None:
    task_manager.append_event(task_id, event)


@app.post("/start")
async def start(request: Request):
    form = await request.form()
    cfg = load_config()

    if form.get("all"):
        selected_accounts = None
    else:
        selected_accounts = form.getlist("accounts")
        if not selected_accounts:
            selected_accounts = None

    mode = form.get("mode", "run")
    test_ip = mode == "test_ip"

    raw_targets = form.get("targets", "").strip()
    targets = [line.strip() for line in raw_targets.splitlines() if line.strip()] or None

    headless = True if form.get("headless") else False

    try:
        tabs = max(1, min(int(form.get("tabs", "1")), 10))
    except ValueError:
        tabs = 1

    task_meta = {
        "mode": "test_ip" if targets is None and test_ip else "run",
        "accounts": selected_accounts or [a.get("name") for a in cfg.get("accounts", [])],
        "headless": headless,
        "tabs": tabs,
        "targets": targets or ("api.ipify" if test_ip else "default"),
    }
    task_id = task_manager.create_task(task_meta)
    task_manager.append_event(task_id, {"status": "running", "type": "queued"})

    executor.submit(
        run,
        cfg,
        selected_accounts,
        test_ip,
        headless,
        targets,
        tabs,
        partial(_task_callback, task_id),
    )

    return RedirectResponse("/", status_code=303)


@app.get("/status")
def status() -> JSONResponse:
    recent = task_manager.get_recent(RECENT_LIMIT)
    return JSONResponse({"recent": recent})
