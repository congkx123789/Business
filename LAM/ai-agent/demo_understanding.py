"""Demo of input/output understanding capabilities."""
import sys
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

sys.path.insert(0, str(Path(__file__).parent))

from ai_agent.lam_agent import LAMAgent

console = Console()

print("\n" + "=" * 60)
print("AI Agent Input/Output Understanding Demo")
print("=" * 60)

# Create agent with understanding capabilities
agent = LAMAgent(
    mode="desktop",
    llm_api_key=None,  # Using heuristic planning
    vision_api_key=None,
    enable_footprint=True,
)

# Test different types of user inputs
test_goals = [
    "Move mouse to center of screen",
    "Click at (500, 300)",
    "Type hello world",
]

console.print("\n[bold cyan]Testing Input Understanding and Output Analysis[/]\n")

for goal in test_goals:
    console.print(Panel(f"[bold]Goal:[/] {goal}", border_style="cyan"))
    
    # Parse input
    parsed = agent.input_parser.parse(goal)
    console.print(f"  [yellow]Parsed Intent:[/] {parsed.intent_type}")
    console.print(f"  [yellow]Action Kind:[/] {parsed.action_kind}")
    console.print(f"  [yellow]Confidence:[/] {parsed.confidence:.2f}")
    
    # Run agent
    console.print(f"\n  [green]Executing...[/]")
    result = agent.run(
        goal=goal,
        max_steps=3,
        save_trajectory=False,
    )
    
    # Show understanding results
    console.print(f"\n  [bold]Execution Results:[/]")
    console.print(f"    Success: {result['success']}")
    console.print(f"    Steps: {result['steps']}")
    
    if result.get('parsed_intent'):
        console.print(f"    Intent Type: {result['parsed_intent']['intent_type']}")
        console.print(f"    Confidence: {result['parsed_intent']['confidence']:.2f}")
    
    if result.get('goal_achievement'):
        achievement = result['goal_achievement']
        console.print(f"    Goal Achieved: {achievement.get('achieved', False)}")
        console.print(f"    Achievement Confidence: {achievement.get('confidence', 0):.2f}")
        if achievement.get('reason'):
            console.print(f"    Reason: {achievement['reason']}")
    
    if result.get('summary'):
        console.print(f"    Summary: {result['summary']}")
    
    # Show execution results for each step
    if result.get('trajectory_steps'):
        table = Table(title="Step-by-Step Execution Analysis")
        table.add_column("Step", style="cyan")
        table.add_column("Action", style="yellow")
        table.add_column("Status", style="green")
        table.add_column("Confidence", style="magenta")
        table.add_column("Changes", style="blue")
        
        for step_data in result['trajectory_steps'][:5]:
            exec_result = step_data.get('execution_result', {})
            action = step_data.get('action', {})
            obs = step_data.get('observation', {})
            
            table.add_row(
                str(step_data.get('step', '-')),
                action.get('kind', 'plan') if action else 'plan',
                obs.get('status', '-'),
                f"{exec_result.get('confidence', 0):.2f}" if exec_result else '-',
                "Yes" if exec_result.get('changes_detected') else "No"
            )
        
        console.print(f"\n  {table}")
    
    console.print("\n" + "-" * 60 + "\n")

agent.stop()

console.print("[bold green]Demo completed![/]\n")
console.print("=" * 60)

