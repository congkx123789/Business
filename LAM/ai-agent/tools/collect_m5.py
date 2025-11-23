"""Collect a small dataset of scripted desktop trajectories for IL (M5).

Usage:
  python tools/collect_m5.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


GOALS = [
    "move to (500, 300)",
    "type hello world",
    "scroll down",
    "press ctrl+c",
    "wait 1 seconds",
    "drag from (400, 400) to (600, 400)",
]


def run(goal: str) -> int:
    cmd = [
        sys.executable,
        "-m",
        "ai_agent.apps.cli",
        "run",
        "--goal",
        goal,
        "--mode",
        "desktop",
        "--no-confirm",
        "--save-trajectory",
    ]
    print("\n$", " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


def main() -> None:
    for goal in GOALS:
        rc = run(goal)
        if rc != 0:
            sys.exit(rc)
    print("\nCollection complete. Trajectories saved in trajectories/.")


if __name__ == "__main__":
    main()


