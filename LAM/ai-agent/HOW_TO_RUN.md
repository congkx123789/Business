# How to Run LAM Agent

## Quick Start

### 1. Install Dependencies (if not done)
```powershell
cd D:\Business\LAM\ai-agent
python -m pip install -e .
```

### 2. Run Simple Demo
```powershell
python demo_lam.py
```

### 3. Run via CLI

#### Basic Mode (Heuristic Planning - No API Key Needed)
```powershell
python -m ai_agent.apps.cli run --goal "Move mouse to center of screen" --mode lam
```

#### Desktop Control Mode (Simple Commands)
```powershell
# Move mouse
python -m ai_agent.apps.cli run --goal "move to (500, 300)" --mode desktop

# Click at coordinates
python -m ai_agent.apps.cli run --goal "click at (500, 300)" --mode desktop

# Type text
python -m ai_agent.apps.cli run --goal "type hello world" --mode desktop

# Scroll
python -m ai_agent.apps.cli run --goal "scroll down" --mode desktop

# Press hotkey
python -m ai_agent.apps.cli run --goal "press ctrl+c" --mode desktop

# Allowlist certain action kinds (policy)
python -m ai_agent.apps.cli run --goal "click at (500, 300)" --mode desktop --allow CLICK,TYPE
```

#### LAM Mode (With LLM - Requires API Key)
```powershell
# Set API key
$env:OPENAI_API_KEY = "sk-your-key-here"

# Run with LLM planning
python -m ai_agent.apps.cli run --goal "Search for Python tutorials on Google" --mode lam
```

## Command Examples

### Desktop Control Commands
```powershell
# Click at screen coordinates
--goal "click at (100, 200)"

# Type text
--goal "type hello world"

# Scroll down/up
--goal "scroll down"
--goal "scroll up"

# Wait
--goal "wait 3 seconds"

# Press keyboard shortcut
--goal "press alt+tab"
--goal "press ctrl+c"

# Move mouse (no click)
--goal "move to (500, 300)"
```

### LAM Mode (High-level Goals)
```powershell
# Search task
--goal "Search for Python tutorials"

# Navigation task
--goal "Open Google and search for AI agents"

# Form filling
--goal "Fill out contact form with name and email"
```

## Safety Features

### Emergency Stop
- **Press `Shift+Esc`** at any time to stop immediately
- Works in desktop and LAM modes

### Confirmation
- By default, CLI asks for confirmation before executing
- Use `--no-confirm` to skip confirmation:
```powershell
python -m ai_agent.apps.cli run --goal "click at (100, 100)" --mode desktop --no-confirm
```

## Output

### Logs
- Execution logs saved in `logs/run-{uuid}.jsonl`
- Contains all actions and observations

### Screenshots
- Screenshots saved in `logs/run-{uuid}-screenshots/`
- Before and after each action

### Trajectories
- Trajectories saved in `trajectories/` directory
- Used for training your own LAM model

### Prepare IL training data
```powershell
python -m ai_agent.apps.cli prepare-il --input-dir trajectories --output-dir models/lam_il
```

### Replay a trajectory (evaluation)
```powershell
python -m ai_agent.apps.cli replay-trajectory --file trajectories/trajectory-<id>.json
```

## Troubleshooting

### Command Not Found
If `agent` command doesn't work:
```powershell
# Use full module path instead
python -m ai_agent.apps.cli run --goal "..." --mode desktop
```

### No Mouse Movement
- Check Windows permissions (may need admin)
- Verify coordinates are on screen
- Try running as administrator

### LLM Not Working
- Check API key is set: `$env:OPENAI_API_KEY`
- Agent will use heuristic planning if no API key
- Heuristic mode works for simple commands

## Advanced Usage

### Programmatic Usage
```python
from ai_agent.lam_agent import LAMAgent

# Create agent
agent = LAMAgent(
    mode="desktop",
    llm_api_key="sk-...",  # Optional
    vision_api_key="sk-...",  # Optional
)

# Run goal
result = agent.run(
    goal="Your goal here",
    max_steps=20,
    save_trajectory=True,
)

# Check results
print(f"Success: {result['success']}")
print(f"Steps: {result['steps']}")

# Stop agent
agent.stop()
```

### Test Individual Components
```powershell
# Test all components
python test_lam.py

# Test desktop control
python test_desktop.py
```

## Next Steps

1. **Start Simple**: Use desktop mode with simple commands
2. **Add API Key**: Enable LLM planning for complex goals
3. **Collect Data**: Run agent on various tasks to build trajectory dataset
4. **Train Model**: Use collected trajectories to fine-tune your LAM

## Acceptance Checks

### Phase 0 — Baseline
- `python demo_lam.py` completes and saves a file under `trajectories/`.
- `python -m ai_agent.apps.cli run --goal "move to (500, 300)" --mode desktop` moves the cursor (no click) and writes logs/screenshots under `logs/`.

### Phase 1 — Use-a-computer loop MVP
- `--mode lam` completes simple multi-step goals (type, scroll, hotkey) and continues saving trajectories.
- UI graph object is produced via `UIGraphBuilder` (internal), even if empty.

### Phase 2 — Learning & robustness
- `python -m ai_agent.apps.cli prepare-il` writes `models/lam_il/training_data.json` with tokenized actions.
- `python -m ai_agent.apps.cli replay-trajectory --file trajectories/trajectory-*.json` replays deterministically and prints metrics.

## Quick Reference

```powershell
# Most common commands
python -m ai_agent.apps.cli run --goal "move to (500, 300)" --mode desktop
python -m ai_agent.apps.cli run --goal "click at (500, 300)" --mode desktop
python -m ai_agent.apps.cli run --goal "type hello" --mode desktop
python -m ai_agent.apps.cli run --goal "Your complex goal" --mode lam
```

Happy automating! 🚀

