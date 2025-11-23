"""Trajectory replay for evaluation."""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Dict, Any

from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.eval.metrics import RunMetrics


def replay_trajectory(path: str | Path, delay_ms: int = 150) -> Dict[str, Any]:
    """Replay a saved trajectory JSON file using the DesktopExecutor.

    Args:
        path: Path to trajectory JSON
        delay_ms: Delay between steps to make replay stable

    Returns:
        Summary with metrics and per-step statuses
    """
    path = Path(path)
    data = json.loads(path.read_text(encoding="utf-8"))

    steps = data.get("steps", [])
    execu = DesktopExecutor()
    statuses = []
    per_step = []
    start_ms = int(time.time() * 1000)
    try:
        for idx, s in enumerate(steps):
            action = s.get("action")
            if not action or not action.get("kind"):
                continue
            t0 = time.time()
            obs = execu.execute(action)
            statuses.append(obs.get("status", "unknown"))
            per_step.append({
                "step": idx,
                "kind": action.get("kind"),
                "status": obs.get("status"),
                "latency_ms": int((time.time() - t0) * 1000),
            })
            time.sleep(delay_ms / 1000.0)
            if execu._stop_requested:
                break
    finally:
        execu.stop()

    duration_ms = int(time.time() * 1000) - start_ms
    success = bool(statuses) and statuses[-1] == "ok"
    metrics = RunMetrics(success=success, steps=len(statuses), duration_ms=duration_ms)
    return {
        "metrics": metrics.__dict__,
        "statuses": statuses,
        "file": str(path),
        "steps": per_step,
        "passed": bool(statuses) and all(s == "ok" for s in statuses),
    }


