# Data Collection Module

This module provides comprehensive input/output data collection for training AI agents. It captures all keyboard and mouse inputs along with screen and system state outputs.

## Features

- **Keyboard Input Capture**: All keystrokes, key combinations, and modifier keys
- **Mouse Input Capture**: Movements, clicks, scrolls, and drags
- **Screen State Capture**: Screenshots with resolution and cursor position
- **System State Capture**: Active window, clipboard, CPU/memory usage, running processes
- **Structured Data Format**: JSON format ready for AI/ML training
- **Real-time Collection**: Low-latency event capture with configurable snapshot intervals

## Quick Start

### Command Line Usage

```bash
# Basic collection (press Ctrl+C to stop)
python tools/collect_training_data.py

# With a goal/task description
python tools/collect_training_data.py --goal "Open browser and search for AI"

# Custom output directory
python tools/collect_training_data.py --output-dir ./my_training_data

# Without screenshots (faster collection)
python tools/collect_training_data.py --no-screenshots

# Custom snapshot interval (every 0.5 seconds)
python tools/collect_training_data.py --snapshot-interval 0.5
```

### Programmatic Usage

```python
from pathlib import Path
from ai_agent.data_collection import InputOutputCollector
import time

# Create collector
collector = InputOutputCollector(
    output_dir=Path("./training_data"),
    capture_screenshots=True,
    screenshot_interval=0.1,  # Screenshot every 100ms
    save_screenshots=True
)

# Start collection
collector.start_collection(goal="My training task")

# Collect for some time
time.sleep(10)  # Or perform your task

# Stop and save
session = collector.stop_collection()
collector.save_session(session)
```

## Data Structure

The collected data is structured as a `TrainingDataSession` containing multiple `InputOutputSnapshot` objects:

### TrainingDataSession
- `session_id`: Unique identifier
- `start_time` / `end_time`: Timestamps
- `goal`: Optional task description
- `snapshots`: List of snapshots
- `metadata`: Additional metadata

### InputOutputSnapshot
Each snapshot contains:

**Inputs:**
- `keyboard_events`: List of `KeyboardEvent` objects
- `mouse_events`: List of `MouseEvent` objects

**Outputs:**
- `screen_state`: `ScreenState` object (screenshot, resolution, cursor)
- `system_state`: `SystemState` object (active window, clipboard, system metrics)

### KeyboardEvent
- `timestamp`: Event timestamp
- `event_type`: 'press', 'release', or 'combination'
- `key`: Key name or character
- `modifiers`: List of active modifiers (ctrl, shift, alt, etc.)
- `is_special`: Whether it's a special key
- `text`: Text character if applicable

### MouseEvent
- `timestamp`: Event timestamp
- `event_type`: 'move', 'click', 'scroll', 'drag_start', 'drag_end', or 'drag'
- `x`, `y`: Coordinates
- `button`: 'left', 'right', 'middle', or None
- `scroll_dx`, `scroll_dy`: Scroll deltas
- `pressed`: Whether button is currently pressed

### ScreenState
- `timestamp`: Screenshot timestamp
- `screenshot_path`: Path to saved screenshot file
- `resolution`: Screen resolution (width, height)
- `cursor_position`: Cursor position (x, y)

### SystemState
- `timestamp`: System state timestamp
- `active_window`: Active window information (title, rect)
- `clipboard`: Current clipboard content
- `cpu_percent`: CPU usage percentage
- `memory_percent`: Memory usage percentage
- `running_processes`: List of running processes

## Output Format

Data is saved as JSON files with the following structure:

```json
{
  "session_id": "uuid",
  "start_time": 1234567890.123,
  "end_time": 1234567900.456,
  "goal": "Task description",
  "snapshots": [
    {
      "snapshot_id": "uuid",
      "timestamp": 1234567890.123,
      "keyboard_events": [...],
      "mouse_events": [...],
      "screen_state": {...},
      "system_state": {...},
      "metadata": {}
    }
  ],
  "metadata": {}
}
```

## Configuration Options

### InputOutputCollector Parameters

- `output_dir`: Directory to save collected data
- `capture_screenshots`: Whether to capture screenshots (default: True)
- `screenshot_interval`: Interval between screenshots in seconds (default: 0.1)
- `max_events_per_snapshot`: Maximum events before creating new snapshot (default: 100)
- `save_screenshots`: Whether to save screenshots to disk (default: True)

## Loading Collected Data

```python
from ai_agent.data_collection import InputOutputCollector
from pathlib import Path

collector = InputOutputCollector(output_dir=Path("./training_data"))
session = collector.load_session("training_data_<session_id>.json")

# Access data
print(f"Session goal: {session.goal}")
print(f"Number of snapshots: {len(session.snapshots)}")

for snapshot in session.snapshots:
    print(f"Snapshot {snapshot.snapshot_id}:")
    print(f"  Keyboard events: {len(snapshot.keyboard_events)}")
    print(f"  Mouse events: {len(snapshot.mouse_events)}")
    if snapshot.screen_state:
        print(f"  Screen: {snapshot.screen_state.resolution}")
```

## Converting to Training Format

The data can be easily converted to dictionary format for ML training:

```python
# Convert session to dictionary
training_dict = session.to_dict()

# Or access individual snapshots
for snapshot in session.snapshots:
    snapshot_dict = {
        "inputs": {
            "keyboard": [asdict(e) for e in snapshot.keyboard_events],
            "mouse": [asdict(e) for e in snapshot.mouse_events]
        },
        "outputs": {
            "screen": asdict(snapshot.screen_state) if snapshot.screen_state else None,
            "system": asdict(snapshot.system_state) if snapshot.system_state else None
        }
    }
```

## Dependencies

Required packages (already in pyproject.toml):
- `pynput`: Keyboard and mouse input capture
- `pyautogui`: Cursor position and screen interaction
- `mss`: Fast screenshot capture
- `Pillow`: Image processing
- `psutil`: System information

Optional (for enhanced features):
- `pyperclip`: Clipboard access
- `pywin32`: Windows-specific features (active window detection)

## Examples

See `examples/collect_training_data_example.py` for complete usage examples.

## Schema

The JSON schema is defined in `schemas/training_data.schema.json` for validation and documentation.

## Notes

- The collector runs in the background and captures events in real-time
- Screenshots are saved to a `screenshots/` subdirectory
- Press Ctrl+C to gracefully stop collection and save data
- Large collections may generate significant disk space (especially with screenshots)
- The collector is thread-safe and can be used in multi-threaded applications

