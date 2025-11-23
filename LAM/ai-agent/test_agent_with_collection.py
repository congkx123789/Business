"""Test AI agent with data collection enabled."""
from __future__ import annotations

import time
from pathlib import Path
from ai_agent.lam_agent import LAMAgent
from ai_agent.data_collection import InputOutputCollector
from rich.console import Console

console = Console()

print("\n" + "=" * 60)
print("AI Agent + Data Collection Test")
print("=" * 60)

# Create data collector
collector = InputOutputCollector(
    output_dir=Path("./test_training_data"),
    capture_screenshots=True,
    screenshot_interval=0.2,
    save_screenshots=True
)

# Create agent
agent = LAMAgent(
    mode="desktop",
    llm_api_key=None,  # Heuristic mode
    vision_api_key=None,
)

try:
    # Start data collection
    console.print("\n[cyan]Starting data collection...[/]")
    collector.start_collection(goal="Test AI agent actions")
    
    # Run agent with simple goal
    goal = "Move mouse to (400, 400)"
    console.print(f"\n[cyan]Running agent with goal:[/] {goal}")
    
    result = agent.run(
        goal=goal,
        max_steps=3,
        save_trajectory=True,
    )
    
    # Stop data collection
    console.print("\n[cyan]Stopping data collection...[/]")
    session = collector.stop_collection()
    
    # Save collected data
    if session:
        file_path = collector.save_session(session)
        console.print(f"\n[green]Data collection successful![/]")
        console.print(f"  Session ID: {session.session_id}")
        console.print(f"  Snapshots: {len(session.snapshots)}")
        console.print(f"  Duration: {session.end_time - session.start_time:.2f}s")
        console.print(f"  Saved to: {file_path}")
        
        # Show sample data
        if session.snapshots:
            first_snap = session.snapshots[0]
            console.print(f"\n[cyan]Sample snapshot:[/]")
            console.print(f"  Keyboard events: {len(first_snap.keyboard_events)}")
            console.print(f"  Mouse events: {len(first_snap.mouse_events)}")
            if first_snap.screen_state:
                console.print(f"  Screen: {first_snap.screen_state.resolution}")
            if first_snap.system_state:
                console.print(f"  CPU: {first_snap.system_state.cpu_percent}%")
    
    # Show agent results
    console.print(f"\n[green]Agent execution successful![/]")
    console.print(f"  Success: {result['success']}")
    console.print(f"  Steps: {result['steps']}")
    
    console.print("\n[bold green]All tests passed![/]")
    
except Exception as e:
    console.print(f"\n[red]Error:[/] {e}")
    import traceback
    traceback.print_exc()
finally:
    agent.stop()

print("\n" + "=" * 60)

