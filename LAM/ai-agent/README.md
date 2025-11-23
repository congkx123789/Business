# AI Agent - Desktop Control

This project implements an AI agent that can control your mouse and keyboard on Windows.

## ⚠️ Safety Features

- **Emergency Stop**: Press `Shift+Esc` at any time to stop immediately
- **Confirmation Required**: Desktop mode requires confirmation before execution
- **Screenshots**: Captures screenshots before/after each action for review

## Installation

```powershell
cd D:\Business\LAM\ai-agent
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -e .
```

## Usage

### Desktop Control Mode

Control mouse and keyboard directly:

```powershell
# Click at coordinates
agent run --goal "click at (500, 300)" --mode desktop

# Type text
agent run --goal "type hello world" --mode desktop

# Scroll down
agent run --goal "scroll down" --mode desktop

# Wait
agent run --goal "wait 2 seconds" --mode desktop

# Press hotkey
agent run --goal "press ctrl+c" --mode desktop

# Move mouse (no click)
agent run --goal "move to (100, 200)" --mode desktop

# Allowlist certain kinds (policy)
agent run --goal "click at (500, 300)" --mode desktop --allow CLICK,TYPE
```

### Command Examples

- `click at (100, 200)` - Click at screen coordinates
- `type hello world` - Type text
- `scroll down` / `scroll up` - Scroll mouse wheel
- `wait 3 seconds` - Wait before next action
- `press ctrl+c` - Press keyboard shortcut
- `move to (x, y)` - Move mouse without clicking

### Mock Mode (Safe - No Control)

```powershell
agent run --goal "Search OpenAI" --mode mock
```

## Output

- **Logs**: `logs/run-{uuid}.jsonl` - JSON logs of all actions
- **Screenshots**: `logs/run-{uuid}-screenshots/` - Before/after screenshots (mock mode creates the folder and a first screenshot)

## Safety Tips

1. **Test with mock mode first** to verify commands
2. **Start with simple commands** like `move to (100, 100)` 
3. **Keep Shift+Esc ready** to stop instantly
4. **Review screenshots** after execution to verify actions

## Troubleshooting

- If `agent` command not found: Use `python -m ai_agent.apps.cli run ...`
- If mouse doesn't move: Check Windows permissions (may need admin)
- If hotkey doesn't work: Try running as administrator

## Roadmap Milestones (0→12 weeks)

### M0 — Bootstrap & smoke tests (Week 1)
- Goals: run mock/desktop/lam; verify logs + screenshots + emergency stop.
- Do: `--mode mock|desktop|lam`, confirm flag, API keys; Shift+Esc visible.
- Done when:
  - `agent run --mode mock` writes plan to `logs/run-*.jsonl` and creates `run-*-screenshots/`.
  - `agent run --mode desktop --goal "move to (500, 300)"` moves cursor (move_only evidence).
  - `agent run --mode lam` prints LAM panel and runs with confirmation.

Run smoke:
```powershell
python tools/smoke_m0.py
```

### M1 — Core loop MVP (Week 2–3)
- Goals: Perceive→Think→Act loop with screenshot + DOM → UI graph → plan → execute → observe.
- Done when: a goal runs N steps and records `trajectory_steps` plus a saved trajectory in `trajectories/`.

