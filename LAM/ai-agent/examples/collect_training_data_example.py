"""Example usage of the InputOutputCollector for training data collection.

This example shows how to programmatically use the collector to gather
training data for AI agents.
"""
from __future__ import annotations

import time
from pathlib import Path
from ai_agent.data_collection import InputOutputCollector


def example_basic_collection():
    """Basic example of collecting data."""
    print("Example 1: Basic Data Collection")
    print("-" * 50)
    
    # Create collector
    collector = InputOutputCollector(
        output_dir=Path("./example_data"),
        capture_screenshots=True,
        screenshot_interval=0.2,  # Screenshot every 200ms
        save_screenshots=True
    )
    
    # Start collection
    collector.start_collection(goal="Example task: typing and clicking")
    
    print("Collecting data for 5 seconds...")
    print("Try typing and moving your mouse!")
    
    # Collect for 5 seconds
    start_time = time.time()
    while time.time() - start_time < 5:
        # Create snapshots periodically
        if len(collector.keyboard_events) + len(collector.mouse_events) > 10:
            collector.add_snapshot()
        time.sleep(0.1)
    
    # Stop and save
    session = collector.stop_collection()
    if session:
        file_path = collector.save_session(session)
        print(f"\nSaved session to: {file_path}")
        print(f"Total snapshots: {len(session.snapshots)}")
        print(f"Duration: {session.end_time - session.start_time:.2f} seconds")


def example_custom_collection():
    """Example with custom settings."""
    print("\nExample 2: Custom Collection Settings")
    print("-" * 50)
    
    collector = InputOutputCollector(
        output_dir=Path("./example_data_custom"),
        capture_screenshots=False,  # No screenshots for faster collection
        save_screenshots=False
    )
    
    collector.start_collection(goal="Fast collection without screenshots")
    
    print("Collecting for 3 seconds (no screenshots)...")
    time.sleep(3)
    
    session = collector.stop_collection()
    if session:
        collector.save_session(session)
        print(f"Saved {len(session.snapshots)} snapshots")


def example_load_and_analyze():
    """Example of loading and analyzing collected data."""
    print("\nExample 3: Loading and Analyzing Data")
    print("-" * 50)
    
    # Assuming we have a saved session
    collector = InputOutputCollector(output_dir=Path("./example_data"))
    
    # List available sessions (you'd need to implement this or know the filename)
    # For this example, we'll just show the structure
    
    print("To load a session:")
    print("  session = collector.load_session('training_data_<session_id>.json')")
    print("\nSession structure:")
    print("  - session_id: Unique identifier")
    print("  - start_time / end_time: Timestamps")
    print("  - goal: Task description")
    print("  - snapshots: List of InputOutputSnapshot objects")
    print("\nEach snapshot contains:")
    print("  - keyboard_events: List of KeyboardEvent objects")
    print("  - mouse_events: List of MouseEvent objects")
    print("  - screen_state: ScreenState object (if captured)")
    print("  - system_state: SystemState object")


def example_training_format():
    """Example of converting to training format."""
    print("\nExample 4: Converting to Training Format")
    print("-" * 50)
    
    collector = InputOutputCollector(output_dir=Path("./example_data"))
    collector.start_collection(goal="Training example")
    
    time.sleep(2)
    
    session = collector.stop_collection()
    if session:
        # Convert to dictionary (ready for JSON/ML training)
        training_dict = session.to_dict()
        
        print("Session converted to dictionary format:")
        print(f"  Keys: {list(training_dict.keys())}")
        print(f"  Number of snapshots: {len(training_dict['snapshots'])}")
        
        if training_dict['snapshots']:
            first_snapshot = training_dict['snapshots'][0]
            print(f"\nFirst snapshot keys: {list(first_snapshot.keys())}")
            print(f"  Keyboard events: {len(first_snapshot.get('keyboard_events', []))}")
            print(f"  Mouse events: {len(first_snapshot.get('mouse_events', []))}")
            print(f"  Has screen state: {first_snapshot.get('screen_state') is not None}")
            print(f"  Has system state: {first_snapshot.get('system_state') is not None}")


if __name__ == "__main__":
    print("=" * 60)
    print("Training Data Collection Examples")
    print("=" * 60)
    
    try:
        example_basic_collection()
        example_custom_collection()
        example_load_and_analyze()
        example_training_format()
        
        print("\n" + "=" * 60)
        print("Examples completed!")
        print("=" * 60)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

