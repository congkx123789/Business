# 🚀 Quick Start Guide - LAM Agent

## Fastest Way to Run

### Option 1: Simple Demo (Recommended First)
```powershell
cd D:\Business\LAM\ai-agent
python demo_lam.py
```

### Option 2: Desktop Control (Simple Commands)
```powershell
cd D:\Business\LAM\ai-agent

# Move mouse
python -m ai_agent.apps.cli run --goal "move to (500, 300)" --mode desktop

# Click
python -m ai_agent.apps.cli run --goal "click at (500, 300)" --mode desktop

# Type
python -m ai_agent.apps.cli run --goal "type hello" --mode desktop
```

### Option 3: LAM Mode (Smart Planning)
```powershell
cd D:\Business\LAM\ai-agent

# Without API key (uses heuristic planning)
python -m ai_agent.apps.cli run --goal "Move mouse to center" --mode lam

# With API key (uses LLM planning)
$env:OPENAI_API_KEY = "sk-your-key"
python -m ai_agent.apps.cli run --goal "Search for Python tutorials" --mode lam
```

## Common Commands

| Action | Command |
|--------|---------|
| Move mouse | `--goal "move to (500, 300)"` |
| Click | `--goal "click at (500, 300)"` |
| Type text | `--goal "type hello world"` |
| Scroll | `--goal "scroll down"` |
| Press key | `--goal "press ctrl+c"` |
| Wait | `--goal "wait 2 seconds"` |

## Safety

- **Emergency Stop**: Press `Shift+Esc` anytime
- **Confirmation**: Will ask before executing (use `--no-confirm` to skip)

## Output Locations

- **Logs**: `logs/run-*.jsonl`
- **Screenshots**: `logs/run-*-screenshots/`
- **Trajectories**: `trajectories/` (for training)

## Quick Test

Try this first:
```powershell
python demo_lam.py
```

Then try:
```powershell
python -m ai_agent.apps.cli run --goal "move to (500, 300)" --mode desktop
```

If it works, you're ready! 🎉

