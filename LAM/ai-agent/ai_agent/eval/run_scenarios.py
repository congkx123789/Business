"""Run evaluation scenarios and compute pass rate."""
from __future__ import annotations

import time
from typing import Dict, Any

from ai_agent.eval.scenarios import all_scenarios


def run_eval() -> Dict[str, Any]:
    results = []
    start = time.time()
    for scenario in all_scenarios():
        try:
            res = scenario()
        except Exception as e:
            res = {"name": getattr(scenario, "__name__", "scenario"), "passed": False, "error": str(e)}
        results.append(res)
    duration_ms = int((time.time() - start) * 1000)
    passed = sum(1 for r in results if r.get("passed"))
    total = len(results)
    pass_rate = (passed / total * 100.0) if total else 0.0
    return {"results": results, "duration_ms": duration_ms, "passed": passed, "total": total, "pass_rate": pass_rate}


