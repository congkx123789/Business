"""Run a simple LAM agent test and show results."""
import sys
from pathlib import Path
from rich.console import Console
from rich.table import Table

sys.path.insert(0, str(Path(__file__).parent))

from ai_agent.lam_agent import LAMAgent

console = Console()

console.print("\n[bold green]Running LAM Agent...[/bold green]\n")

# Create agent
agent = LAMAgent(mode="desktop", llm_api_key=None, vision_api_key=None)

# Run a simple goal
console.print("[cyan]Goal:[/] Move mouse to center of screen\n")
console.print("[yellow]Executing...[/yellow]\n")

result = agent.run(
    goal="Move mouse to center of screen",
    max_steps=3,
    save_trajectory=True,
)

# Show results
console.print("\n[bold green]Results:[/bold green]")
console.print(f"Success: {result['success']}")
console.print(f"Steps: {result['steps']}")

if result.get("trajectory_steps"):
    table = Table(title="Execution Steps")
    table.add_column("Step", style="cyan")
    table.add_column("Action", style="yellow")
    table.add_column("Status", style="green")
    
    for i, step_data in enumerate(result["trajectory_steps"][:5], 1):
        action = step_data.get("action", {})
        obs = step_data.get("observation", {})
        table.add_row(
            str(i),
            action.get("kind", "plan") if action else "plan",
            obs.get("status", "-"),
        )
    console.print(table)

# Check trajectories
traj_dir = Path("trajectories")
if traj_dir.exists():
    traj_files = list(traj_dir.glob("trajectory-*.json"))
    console.print(f"\n[bold green]Trajectories saved:[/bold green] {len(traj_files)}")
    if traj_files:
        console.print(f"Latest: {traj_files[-1].name}")

agent.stop()
console.print("\n[bold green]Done![/bold green]\n")

