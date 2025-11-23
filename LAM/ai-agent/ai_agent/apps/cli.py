import os
import json
import uuid
import click
import time
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Confirm

from ai_agent.control.planner import Planner
from ai_agent.control.interactive_planner import InteractivePlanner
from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.perception.screenshot import capture_screenshot
from ai_agent.lam_agent import LAMAgent
from ai_agent.training.state_action import TrajectoryStore
from ai_agent.training.il_pipeline import train_il
from ai_agent.eval.replay import replay_trajectory
from ai_agent.safety.policy import CapabilityPolicy
from ai_agent.eval.run_scenarios import run_eval
from ai_agent.action.visual_feedback import annotate_mouse_position, annotate_mouse_path


console = Console()


def _log_dir() -> Path:
    return Path(os.getenv("LOG_DIR", "logs")).absolute()


@click.group()
def main() -> None:
    """AI Agent CLI."""


@main.command()
@click.option("--goal", required=True, type=str, help="High-level user goal or command")
@click.option("--mode", default="mock", type=click.Choice(["mock", "llm", "desktop", "lam"]), show_default=True)
@click.option("--allow", default="", type=str, help="Comma-separated domain allowlist")
@click.option("--confirm", default=True, is_flag=True, help="Require confirmation before desktop actions")
@click.option("--save-trajectory/--no-save-trajectory", default=True, show_default=True, help="Save a trajectory JSON for training")
@click.option("--llm-api-key", default=None, envvar="OPENAI_API_KEY", help="OpenAI API key for LAM")
@click.option("--vision-api-key", default=None, envvar="OPENAI_API_KEY", help="Vision API key (defaults to LLM key)")
def run(goal: str, mode: str, allow: str, confirm: bool, save_trajectory: bool, llm_api_key: str, vision_api_key: str) -> None:
    """Run a goal (mock planner by default)."""
    
    if mode == "lam":
        _run_lam(goal, llm_api_key, vision_api_key, confirm, save_trajectory)
    elif mode == "desktop":
        _run_desktop(goal, confirm, allow, save_trajectory)
    else:
        _run_mock(goal, mode)


def _run_lam(goal: str, llm_api_key: str, vision_api_key: str, confirm: bool, save_trajectory: bool) -> None:
    """Run LAM (Large Action Model) mode."""
    console.print(Panel(
        "[bold green]🤖 LARGE ACTION MODEL MODE[/]\n\n"
        "This uses LLM-based planning with vision grounding.\n"
        "[yellow]Press Shift+Esc at any time to stop immediately.[/]\n\n"
        "Features:\n"
        "  • Hierarchical goal decomposition\n"
        "  • Vision + DOM fusion for UI understanding\n"
        "  • ReAct-style reasoning loop\n"
        "  • Trajectory collection for learning",
        title="LAM Agent",
        border_style="green"
    ))
    
    if confirm:
        if not Confirm.ask("\n[bold]Continue with LAM agent?"):
            console.print("[red]Cancelled.[/]")
            return
    
    agent = LAMAgent(
        mode="desktop",
        llm_api_key=llm_api_key,
        vision_api_key=vision_api_key or llm_api_key,
    )
    
    try:
        console.print(f"\n[bold cyan]Goal:[/] {goal}")
        console.print("[yellow]Starting LAM agent...[/]\n")
        
        result = agent.run(goal, max_steps=20, save_trajectory=save_trajectory)
        
        console.print(f"\n[bold green]Execution complete[/]")
        console.print(f"Success: {result['success']}")
        console.print(f"Steps: {result['steps']}")
        
        if result.get("trajectory"):
            console.print(f"Trajectory saved for training")
        
        # Show trajectory summary
        if result.get("trajectory_steps"):
            table = Table(title="Trajectory Summary")
            table.add_column("Step")
            table.add_column("Action")
            table.add_column("Status")
            
            for step_data in result["trajectory_steps"][:10]:  # Show first 10
                action = step_data.get("action", {})
                obs = step_data.get("observation", {})
                table.add_row(
                    str(step_data.get("step", "-")),
                    action.get("kind", "plan") if action else "plan",
                    obs.get("status", "-"),
                )
            console.print(table)
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Interrupted by user[/]")
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/]")
    finally:
        agent.stop()


def _run_desktop(goal: str, confirm: bool, allow: str, save_trajectory: bool) -> None:
    """Run desktop control mode."""
    console.print(Panel(
        "[bold red]⚠️  DESKTOP CONTROL MODE[/]\n\n"
        "This will control your mouse and keyboard.\n"
        "[yellow]Press Shift+Esc at any time to stop immediately.[/]\n\n"
        "Examples:\n"
        "  • [cyan]click at (100, 200)[/]\n"
        "  • [cyan]type hello world[/]\n"
        "  • [cyan]scroll down[/]\n"
        "  • [cyan]wait 2 seconds[/]\n"
        "  • [cyan]press ctrl+c[/]",
        title="Desktop Control",
        border_style="yellow"
    ))
    
    if confirm:
        if not Confirm.ask("\n[bold]Continue and allow mouse/keyboard control?"):
            console.print("[red]Cancelled.[/]")
            return
    
    planner = InteractivePlanner()
    executor = DesktopExecutor()
    allowed = set([a.strip().upper() for a in allow.split(",") if a.strip()])
    # Load capability policy (domain-agnostic for desktop use)
    policy = CapabilityPolicy.load(Path("configs/policy.yaml"))
    
    plan = planner.plan(goal)
    
    _log_dir().mkdir(parents=True, exist_ok=True)
    run_id = str(uuid.uuid4())
    log_path = _log_dir() / f"run-{run_id}.jsonl"
    screenshots_dir = _log_dir() / f"run-{run_id}-screenshots"
    screenshots_dir.mkdir(exist_ok=True)
    
    console.rule("Plan")
    table = Table(title="Plan Steps")
    table.add_column("id")
    table.add_column("goal")
    table.add_column("kind")
    for step in plan:
        table.add_row(
            step.get("id", "-")[:8],
            step.get("goal", "-")[:50],
            step.get("kind", "-")
        )
    console.print(table)
    
    console.print("\n[yellow]Starting execution in 3 seconds...[/]")
    for i in range(3, 0, -1):
        console.print(f"[yellow]{i}...[/]", end="\r")
        time.sleep(1)
    console.print("\n[bold green]Executing...[/]\n")
    
    # For IL collection
    trajectory_steps = []

    try:
        for i, step in enumerate(plan):
            if executor._stop_requested:
                console.print("\n[red]Stopped by user (Shift+Esc)[/]")
                break
            
            # Capture screenshot before action
            screenshot_path = screenshots_dir / f"step-{i:03d}-before.png"
            t_before = time.time()
            capture_screenshot(screenshot_path)
            
            # Annotate "before" screenshot with current mouse position
            if step.get("kind") in ["CLICK", "DRAG", "DOUBLE_CLICK", "RIGHT_CLICK"]:
                try:
                    from ai_agent.action.desktop_executor import DesktopExecutor
                    current_pos = executor.get_mouse_position()
                    annotate_mouse_position(
                        screenshot_path,
                        current_pos,
                        color="green",  # Green for "before" position
                        outline_color="white",
                        radius=12
                    )
                except Exception:
                    pass
            
            with log_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "event": "screenshot",
                    "ts": t_before,
                    "step": i,
                    "phase": "before",
                    "path": str(screenshot_path),
                }) + "\n")
            
            # Execute action if it has a kind
            if step.get("kind"):
                action = {
                    "action_id": step.get("action_id", str(uuid.uuid4())),
                    "kind": step["kind"],
                    "target": step.get("target", {}),
                    "input_text": step.get("input_text", ""),
                    "meta": step.get("meta", {}),
                }
                # Enforce allowlist if provided
                if allowed and action["kind"].upper() not in allowed:
                    console.print(f"[yellow]Skipping disallowed action kind:[/] {action['kind']}")
                    with log_path.open("a", encoding="utf-8") as f:
                        f.write(json.dumps({
                            "event": "policy_denied",
                            "ts": time.time(),
                            "step": i,
                            "reason": "cli_allowlist",
                            "payload": action,
                        }) + "\n")
                    continue
                # Enforce capability policy
                if not policy.is_action_allowed(domain="*", kind=action["kind"]):
                    console.print(f"[yellow]Denied by policy:[/] {action['kind']}")
                    with log_path.open("a", encoding="utf-8") as f:
                        f.write(json.dumps({
                            "event": "policy_denied",
                            "ts": time.time(),
                            "step": i,
                            "reason": "capability_policy",
                            "payload": action,
                        }) + "\n")
                    continue
                # HITL for risky intents
                if policy.requires_hitl(goal, domain="*") and confirm:
                    if not Confirm.ask(f"[bold yellow]Risky intent detected (HITL): proceed with {action['kind']}?[/]"):
                        console.print("[red]User rejected risky action[/]")
                        with log_path.open("a", encoding="utf-8") as f:
                            f.write(json.dumps({
                                "event": "policy_denied",
                                "ts": time.time(),
                                "step": i,
                                "reason": "hitl_rejected",
                                "payload": action,
                            }) + "\n")
                        continue
                
                console.print(f"[cyan]Step {i+1}:[/] {step.get('goal', 'Unknown')}")

                # Retry with backoff for retryable_error
                max_retries = 2
                backoff = 0.3
                attempt = 0
                t_start = time.time()
                while True:
                    observation = executor.execute(action)
                    if observation.get("status") != "retryable_error" or attempt >= max_retries:
                        break
                    time.sleep(backoff)
                    backoff *= 2
                    attempt += 1
                
                # Log
                with log_path.open("a", encoding="utf-8") as f:
                    f.write(json.dumps({
                        "event": "action",
                        "ts": t_start,
                        "step": i,
                        "payload": action,
                    }) + "\n")
                    f.write(json.dumps({
                        "event": "observation",
                        "ts": time.time(),
                        "step": i,
                        "latency_ms": int((time.time() - t_start) * 1000),
                        "attempts": attempt + 1,
                        "payload": observation,
                    }) + "\n")
                
                if observation["status"] == "ok":
                    console.print(f"  [green]✓ {observation['status']}[/]")
                else:
                    console.print(f"  [red]✗ {observation['status']}[/]")
                    if "error" in observation.get("evidence", {}):
                        console.print(f"    Error: {observation['evidence']['error']}")

                # Append to trajectory steps for IL
                trajectory_steps.append({
                    "step": i,
                    "state": {"screenshot_before": str(screenshot_path)},
                    "action": action,
                    "observation": observation,
                })
            
            # Capture screenshot after action
            screenshot_path = screenshots_dir / f"step-{i:03d}-after.png"
            t_after = time.time()
            capture_screenshot(screenshot_path)
            
            # Annotate screenshot with mouse position if action involved mouse movement
            if step.get("kind") in ["CLICK", "DRAG", "DOUBLE_CLICK", "RIGHT_CLICK"]:
                evidence = observation.get("evidence", {})
                mouse_after = evidence.get("mouse_after")
                mouse_before = evidence.get("mouse_before")
                
                if mouse_after:
                    # Add red circle at mouse position
                    annotate_mouse_position(
                        screenshot_path,
                        tuple(mouse_after),
                        color="red",
                        outline_color="yellow",
                        radius=15
                    )
                
                # For drag actions, show the path
                if step.get("kind") == "DRAG" and mouse_before and mouse_after:
                    annotate_mouse_path(
                        screenshot_path,
                        tuple(mouse_before),
                        tuple(mouse_after),
                        color="blue",
                        width=3
                    )
            
            with log_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "event": "screenshot",
                    "ts": t_after,
                    "step": i,
                    "phase": "after",
                    "path": str(screenshot_path),
                }) + "\n")
            
            time.sleep(0.3)  # Small delay between steps
        
        console.print(f"\n[bold green]Execution complete[/]")
        console.print(f"Logs: {log_path}")
        console.print(f"Screenshots: {screenshots_dir}")
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Interrupted by user[/]")
    finally:
        executor.stop()

    # Save trajectory for IL if requested
    try:
        if save_trajectory and trajectory_steps:
            from ai_agent.training.il_pipeline import collect_trajectory
            success = trajectory_steps[-1].get("observation", {}).get("status") == "ok"
            store = TrajectoryStore(Path("trajectories"))
            collect_trajectory(goal=goal, steps=trajectory_steps, success=success, store=store)
            console.print("[green]Trajectory saved for IL[/]")
    except Exception as e:
        console.print(f"[yellow]Could not save trajectory: {e}")


def _run_mock(goal: str, mode: str) -> None:
    """Run mock/LLM mode."""
    planner = Planner()
    plan = planner.plan(goal)

    _log_dir().mkdir(parents=True, exist_ok=True)
    run_id = str(uuid.uuid4())
    log_path = _log_dir() / f"run-{run_id}.jsonl"
    screenshots_dir = _log_dir() / f"run-{run_id}-screenshots"
    screenshots_dir.mkdir(exist_ok=True)

    console.rule("Plan")
    table = Table(title="Plan Steps")
    table.add_column("id")
    table.add_column("goal")
    for step in plan:
        table.add_row(step.get("id", "-"), step.get("goal", "-"))
    console.print(table)

    # Save a single screenshot artifact so smoke tests can verify directory presence
    try:
        capture_screenshot(screenshots_dir / "step-000-before.png")
    except Exception:
        pass

    with log_path.open("a", encoding="utf-8") as f:
        for step in plan:
            f.write(json.dumps({"event": "plan", "payload": step}) + "\n")

    console.print(f"\n[bold green]Mock run complete[/] — logs: {log_path}")
    console.print(f"Screenshots: {screenshots_dir}")


@main.command()
@click.option("--port", default=8080, show_default=True, type=int)
def serve(port: int) -> None:
    """Start HTTP server (stub)."""
    console.print(f"Starting server on :{port} (stub)")



@main.command("prepare-il")
@click.option("--input-dir", default="trajectories", show_default=True, type=click.Path(exists=True, file_okay=False))
@click.option("--output-dir", default="models/lam_il", show_default=True, type=click.Path(file_okay=False))
def prepare_il(input_dir: str, output_dir: str) -> None:
    """Prepare IL training data from saved trajectories."""
    store = TrajectoryStore(Path(input_dir))
    trajectories = []
    for fname in store.list_all():
        try:
            trajectories.append(store.load(fname))
        except Exception:
            pass
    if not trajectories:
        console.print("[red]No trajectories found.[/]")
        return
    result = train_il(trajectories, Path(output_dir))
    console.print(f"[green]Prepared:[/] {result['training_data_path']}")
    console.print(f"Trajectories: {result['num_trajectories']}  Tokens: {result['total_actions']}")


@main.command("replay-trajectory")
@click.option("--file", required=True, type=click.Path(exists=True, dir_okay=False))
@click.option("--delay-ms", default=150, show_default=True, type=int)
def replay_cmd(file: str, delay_ms: int) -> None:
    """Replay a saved trajectory JSON for evaluation."""
    console.print(Panel(f"Replaying trajectory: [cyan]{file}[/]", title="Replay"))
    try:
        summary = replay_trajectory(file, delay_ms)
        console.print(f"Success: {summary['metrics']['success']}  Steps: {summary['metrics']['steps']}  Duration: {summary['metrics']['duration_ms']}ms")
        console.print(f"Pass/Fail: {'PASS' if summary.get('passed') else 'FAIL'}")
    except Exception as e:
        console.print(f"[red]Replay error:[/] {e}")


@main.command("replay")
@click.argument("file", type=click.Path(exists=True, dir_okay=False))
@click.option("--delay-ms", default=150, show_default=True, type=int)
def replay_simple(file: str, delay_ms: int) -> None:
    """Replay a saved trajectory (alias for replay-trajectory)."""
    replay_cmd.callback(file=file, delay_ms=delay_ms)  # type: ignore[attr-defined]


@main.command("eval-run")
def eval_run() -> None:
    """Run deterministic evaluation scenarios and print pass rate."""
    console.print(Panel("Running evaluation scenarios", title="Eval"))
    summary = run_eval()
    table = Table(title="Scenario Results")
    table.add_column("name")
    table.add_column("passed")
    table.add_column("steps")
    for r in summary["results"]:
        table.add_row(r.get("name", "-"), "PASS" if r.get("passed") else "FAIL", str(r.get("steps", "-")))
    console.print(table)
    console.print(f"Pass rate: {summary['pass_rate']:.1f}% ({summary['passed']}/{summary['total']})  Duration: {summary['duration_ms']}ms")

