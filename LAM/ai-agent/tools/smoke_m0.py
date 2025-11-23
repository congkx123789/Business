"""M0 smoke tests: mock, desktop (move-only), lam panel.

Run with:
  python tools/smoke_m0.py
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(cmd: list[str]) -> int:
    print("\n$", " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


def main() -> None:
    # 1) Mock mode: should write logs and screenshots dir
    rc = run([sys.executable, "-m", "ai_agent.apps.cli", "run", "--goal", "hello", "--mode", "mock", "--no-confirm"])
    if rc != 0:
        sys.exit(rc)

    # 2) Desktop move-only: safe cursor move (no click)
    rc = run([sys.executable, "-m", "ai_agent.apps.cli", "run", "--goal", "move to (500, 300)", "--mode", "desktop", "--no-confirm"])
    if rc != 0:
        sys.exit(rc)

    # 3) LAM mode: panel + confirmation prompt (user may cancel)
    # Use --no-confirm if you want to auto-accept
    rc = run([sys.executable, "-m", "ai_agent.apps.cli", "run", "--goal", "demo goal", "--mode", "lam", "--no-confirm"])
    if rc != 0:
        sys.exit(rc)

    print("\nSmoke tests completed.")


if __name__ == "__main__":
    main()


