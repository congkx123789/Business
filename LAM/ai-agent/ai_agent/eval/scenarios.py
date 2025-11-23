"""Deterministic evaluation scenarios (desktop-focused)."""
from __future__ import annotations

import time
from typing import Dict, Any, List, Callable

from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.control.interactive_planner import InteractivePlanner


Scenario = Callable[[], Dict[str, Any]]


def scenario_move_and_assert() -> Dict[str, Any]:
    planner = InteractivePlanner()
    execu = DesktopExecutor()
    try:
        steps = planner.plan("move to (500, 300)") + planner.plan("assert cursor near (500, 300)")
        statuses: List[str] = []
        for s in steps:
            if s.get("kind"):
                obs = execu.execute({
                    "action_id": s.get("action_id"),
                    "kind": s.get("kind"),
                    "target": s.get("target", {}),
                    "input_text": s.get("input_text", ""),
                    "meta": s.get("meta", {}),
                })
                statuses.append(obs.get("status", "unknown"))
                time.sleep(0.15)
        passed = len(statuses) >= 1 and statuses[-1] == "ok"
        return {"name": "move_and_assert", "passed": passed, "steps": len(statuses)}
    finally:
        execu.stop()


def scenario_type_and_hotkey() -> Dict[str, Any]:
    planner = InteractivePlanner()
    execu = DesktopExecutor()
    try:
        steps = planner.plan("type hello") + planner.plan("press ctrl+c")
        statuses: List[str] = []
        for s in steps:
            if s.get("kind"):
                obs = execu.execute({
                    "action_id": s.get("action_id"),
                    "kind": s.get("kind"),
                    "target": s.get("target", {}),
                    "input_text": s.get("input_text", ""),
                    "meta": s.get("meta", {}),
                })
                statuses.append(obs.get("status", "unknown"))
                time.sleep(0.15)
        passed = all(s == "ok" for s in statuses)
        return {"name": "type_and_hotkey", "passed": passed, "steps": len(statuses)}
    finally:
        execu.stop()


def all_scenarios() -> List[Scenario]:
    return [scenario_move_and_assert, scenario_type_and_hotkey]


