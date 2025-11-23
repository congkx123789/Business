"""Collect comprehensive training data (keyboard, mouse, screen, system).

This tool captures all inputs (keyboard, mouse) and outputs (screen, system state)
for training AI agents.

Usage:
    # Basic collection (press Ctrl+C to stop)
    python tools/collect_training_data.py
    
    # With goal/task description
    python tools/collect_training_data.py --goal "Open browser and search"
    
    # Custom output directory
    python tools/collect_training_data.py --output-dir ./my_data
    
    # Without screenshots (faster)
    python tools/collect_training_data.py --no-screenshots
    
    # Custom snapshot interval
    python tools/collect_training_data.py --snapshot-interval 0.5
"""
from __future__ import annotations

import sys
import signal
import argparse
from pathlib import Path

# Add parent directory to path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ai_agent.data_collection import InputOutputCollector


def signal_handler(sig, frame, collector: InputOutputCollector):
    """Handle Ctrl+C to gracefully stop collection."""
    print("\n\nStopping data collection...")
    session = collector.stop_collection()
    if session:
        collector.save_session(session)
        print(f"\nSession saved with {len(session.snapshots)} snapshots.")
        print(f"Total duration: {session.end_time - session.start_time:.2f} seconds")
    sys.exit(0)


def main():
    parser = argparse.ArgumentParser(
        description="Collect comprehensive training data for AI agents"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./training_data",
        help="Directory to save collected data (default: ./training_data)"
    )
    parser.add_argument(
        "--goal",
        type=str,
        default=None,
        help="Optional goal or task description for this session"
    )
    parser.add_argument(
        "--no-screenshots",
        action="store_true",
        help="Disable screenshot capture (faster, less data)"
    )
    parser.add_argument(
        "--snapshot-interval",
        type=float,
        default=0.1,
        help="Interval between automatic snapshots in seconds (default: 0.1)"
    )
    parser.add_argument(
        "--max-events",
        type=int,
        default=100,
        help="Maximum events per snapshot before creating new one (default: 100)"
    )
    parser.add_argument(
        "--no-save-screenshots",
        action="store_true",
        help="Don't save screenshots to disk (only keep in memory)"
    )
    
    args = parser.parse_args()
    
    # Create collector
    collector = InputOutputCollector(
        output_dir=Path(args.output_dir),
        capture_screenshots=not args.no_screenshots,
        screenshot_interval=args.snapshot_interval,
        max_events_per_snapshot=args.max_events,
        save_screenshots=not args.no_save_screenshots
    )
    
    # Setup signal handler for Ctrl+C
    def handler(sig, frame):
        signal_handler(sig, frame, collector)
    
    signal.signal(signal.SIGINT, handler)
    
    # Start collection
    print("=" * 60)
    print("Training Data Collector")
    print("=" * 60)
    print(f"Output directory: {args.output_dir}")
    print(f"Screenshots: {'Enabled' if not args.no_screenshots else 'Disabled'}")
    print(f"Snapshot interval: {args.snapshot_interval}s")
    print("\nPress Ctrl+C to stop collection and save data.")
    print("=" * 60)
    print()
    
    collector.start_collection(goal=args.goal)
    
    # Periodically create snapshots
    import time
    try:
        last_snapshot_time = time.time()
        while True:
            current_time = time.time()
            # Create snapshot periodically or when event buffer is full
            if (current_time - last_snapshot_time >= args.snapshot_interval or
                len(collector.keyboard_events) + len(collector.mouse_events) >= args.max_events):
                collector.add_snapshot()
                last_snapshot_time = current_time
                # Print progress
                if collector.current_session:
                    print(f"\rCollected {len(collector.current_session.snapshots)} snapshots...", end="", flush=True)
            time.sleep(0.01)  # Small sleep to prevent CPU spinning
    except KeyboardInterrupt:
        # Handled by signal handler
        pass


if __name__ == "__main__":
    main()

