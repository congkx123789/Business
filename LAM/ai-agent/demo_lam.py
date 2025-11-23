"""Demo LAM agent with a simple goal."""
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from ai_agent.lam_agent import LAMAgent
from rich.console import Console

console = Console()

print("\n" + "=" * 60)
print("LAM Agent Demo")
print("=" * 60)

# Create agent (without LLM for now - uses heuristic planning)
agent = LAMAgent(
    mode="desktop",
    llm_api_key=None,  # Will use heuristic planning
    vision_api_key=None,
)

goal = "Move mouse to center of screen"

console.print(f"\n[cyan]Goal:[/] {goal}")
console.print("[yellow]Running LAM agent (heuristic mode)...[/]\n")

try:
    # Run agent
    result = agent.run(
        goal=goal,
        max_steps=5,  # Limit steps for demo
        save_trajectory=True,
    )
    
    console.print(f"\n[green]Execution complete![/]")
    console.print(f"Success: {result['success']}")
    console.print(f"Steps executed: {result['steps']}")
    
    if result.get("trajectory"):
        console.print(f"[green]Trajectory saved for training![/]")
        console.print(f"Location: {result['trajectory'].metadata.get('file_path', 'trajectories/')}")
    
    # Show trajectory steps
    if result.get("trajectory_steps"):
        console.print("\n[bold]Trajectory Summary:[/]")
        for i, step_data in enumerate(result["trajectory_steps"][:3], 1):
            action = step_data.get("action", {})
            obs = step_data.get("observation", {})
            console.print(f"  Step {i}: {action.get('kind', 'plan')} -> {obs.get('status', '-')}")
    
except Exception as e:
    console.print(f"\n[red]Error:[/] {e}")
    import traceback
    traceback.print_exc()
finally:
    agent.stop()

print("\n" + "=" * 60)

