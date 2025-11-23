# Data Collection Quick Start Guide

## Overview

This data collection system captures **all inputs** (keyboard, mouse) and **all outputs** (screen, system state) from your computer in a structured format perfect for training AI agents.

## What Gets Captured

### Inputs (What you do):
- ✅ **Keyboard**: Every keystroke, key combinations, modifiers (Ctrl, Shift, Alt)
- ✅ **Mouse**: Movements, clicks, scrolls, drags, position

### Outputs (What the computer shows):
- ✅ **Screen**: Screenshots, resolution, cursor position
- ✅ **System**: Active window, clipboard, CPU/memory usage, running processes

## Quick Usage

### Option 1: Command Line (Easiest)

```bash
# Start collecting (press Ctrl+C to stop)
cd ai-agent
python tools/collect_training_data.py

# With a task description
python tools/collect_training_data.py --goal "Open browser and search"

# Save to custom directory
python tools/collect_training_data.py --output-dir ./my_data
```

### Option 2: Python Code

```python
from pathlib import Path
from ai_agent.data_collection import InputOutputCollector
import time

# Create collector
collector = InputOutputCollector(
    output_dir=Path("./training_data"),
    capture_screenshots=True
)

# Start collecting
collector.start_collection(goal="My task")

# Do your work (type, click, etc.)
time.sleep(30)  # Or perform actual tasks

# Stop and save
session = collector.stop_collection()
collector.save_session(session)
```

## Output Structure

Data is saved as JSON files with this structure:

```
training_data/
├── training_data_<session_id>.json    # Main data file
└── screenshots/                        # Screenshot images
    ├── screenshot_1234567890.png
    └── ...
```

Each JSON file contains:
- Session metadata (ID, timestamps, goal)
- Multiple snapshots, each with:
  - Keyboard events (what keys were pressed)
  - Mouse events (movements, clicks)
  - Screen state (screenshot path, resolution)
  - System state (active window, clipboard, etc.)

## Data Format Example

```json
{
  "session_id": "abc-123",
  "start_time": 1234567890.123,
  "goal": "Open browser",
  "snapshots": [
    {
      "timestamp": 1234567890.123,
      "keyboard_events": [
        {
          "timestamp": 1234567890.125,
          "event_type": "press",
          "key": "a",
          "text": "a",
          "modifiers": []
        }
      ],
      "mouse_events": [
        {
          "timestamp": 1234567890.200,
          "event_type": "click",
          "x": 500,
          "y": 300,
          "button": "left"
        }
      ],
      "screen_state": {
        "screenshot_path": "screenshots/screenshot_1234567890.png",
        "resolution": {"width": 1920, "height": 1080},
        "cursor_position": {"x": 500, "y": 300}
      },
      "system_state": {
        "active_window": {"title": "Browser"},
        "cpu_percent": 15.5,
        "memory_percent": 45.2
      }
    }
  ]
}
```

## Loading and Using Data

```python
from ai_agent.data_collection import InputOutputCollector
from pathlib import Path

# Load collected data
collector = InputOutputCollector(output_dir=Path("./training_data"))
session = collector.load_session("training_data_<session_id>.json")

# Access the data
for snapshot in session.snapshots:
    # Inputs
    for kb_event in snapshot.keyboard_events:
        print(f"Key: {kb_event.key}, Time: {kb_event.timestamp}")
    
    for mouse_event in snapshot.mouse_events:
        print(f"Mouse: {mouse_event.event_type} at ({mouse_event.x}, {mouse_event.y})")
    
    # Outputs
    if snapshot.screen_state:
        print(f"Screen: {snapshot.screen_state.resolution}")
        print(f"Screenshot: {snapshot.screen_state.screenshot_path}")
    
    if snapshot.system_state:
        print(f"Active window: {snapshot.system_state.active_window}")

# Convert to dictionary for ML training
training_dict = session.to_dict()
```

## Configuration Options

```python
collector = InputOutputCollector(
    output_dir=Path("./data"),
    capture_screenshots=True,        # Capture screenshots (default: True)
    screenshot_interval=0.1,         # Screenshot every 100ms (default: 0.1)
    max_events_per_snapshot=100,     # Max events per snapshot (default: 100)
    save_screenshots=True            # Save screenshots to disk (default: True)
)
```

## Command Line Options

```bash
python tools/collect_training_data.py \
    --output-dir ./my_data \          # Output directory
    --goal "Task description" \        # Task/goal description
    --no-screenshots \                 # Disable screenshots (faster)
    --snapshot-interval 0.5 \          # Snapshot interval in seconds
    --max-events 50 \                  # Max events per snapshot
    --no-save-screenshots              # Don't save screenshots to disk
```

## Tips

1. **Start simple**: Use default settings first
2. **Add goals**: Always provide a `--goal` to label your data
3. **Disk space**: Screenshots use space; use `--no-screenshots` if needed
4. **Performance**: Lower `--snapshot-interval` for more data but slower collection
5. **Stop gracefully**: Press Ctrl+C to save data properly

## Files Created

- `ai_agent/data_collection/input_output_collector.py` - Main collector module
- `ai_agent/data_collection/__init__.py` - Module exports
- `ai_agent/data_collection/README.md` - Full documentation
- `tools/collect_training_data.py` - Command-line tool
- `examples/collect_training_data_example.py` - Usage examples
- `schemas/training_data.schema.json` - JSON schema

## Next Steps

1. Run a test collection: `python tools/collect_training_data.py --goal "test"`
2. Check the output in `training_data/` directory
3. Load and inspect the data using the examples
4. Use the data structure for your AI training pipeline

For more details, see `ai_agent/data_collection/README.md`

