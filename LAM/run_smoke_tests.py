import json
import os
import subprocess
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
AGENT_DIR = PROJECT_ROOT / "ai-agent"
PYTHON = sys.executable


def run(cmd, cwd: Path, timeout: int = 60) -> tuple[int, str, str]:
    proc = subprocess.Popen(
        cmd,
        cwd=str(cwd),
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        out, err = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        proc.kill()
        return 124, "", f"TIMEOUT after {timeout}s"
    return proc.returncode, out, err


def check_file_exists(path: Path) -> bool:
    try:
        return path.exists() and path.stat().st_size > 0
    except Exception:
        return False


def test_compile() -> dict:
    code, out, err = run(f"{PYTHON} -m compileall ai_agent", AGENT_DIR, timeout=60)
    return {"name": "compile_all", "ok": code == 0, "code": code, "out": out, "err": err}


def test_demo() -> dict:
    code, out, err = run(f"{PYTHON} demo_lam.py", AGENT_DIR, timeout=90)
    ok = code == 0 and ("Success:" in out or "Success:" in err)
    return {"name": "demo_lam", "ok": ok, "code": code, "out": out, "err": err}


def test_cli_desktop_move() -> dict:
    cmd = (
        f"{PYTHON} -m ai_agent.apps.cli run --goal \"move to (500, 300)\" --mode desktop --no-confirm"
    )
    code, out, err = run(cmd, AGENT_DIR, timeout=60)
    return {"name": "cli_desktop_move", "ok": code == 0, "code": code, "out": out, "err": err}


def test_programmatic_executor_move() -> dict:
    # 最小入侵的移動測試（不點擊）
    snippet = (
        "from ai_agent.action.desktop_executor import DesktopExecutor;"
        "import pyautogui, time;"
        "w,h = pyautogui.size();"
        "x,y = int(w/2), int(h/2);"
        "ex = DesktopExecutor(enable_overlay=True);"
        "action = {'kind': 'CLICK', 'target': {'bbox': [x-5,y-5,10,10]}, 'meta': {'move_only': True}};"
        "print(ex.execute(action));"
        "ex.stop();"
    )
    code, out, err = run(f"{PYTHON} -c \"{snippet}\"", AGENT_DIR, timeout=60)
    ok = code == 0 and "status" in out
    return {"name": "programmatic_executor_move", "ok": ok, "code": code, "out": out, "err": err}


def test_trajectories_written() -> dict:
    traj_dir = AGENT_DIR / "trajectories"
    files = sorted(traj_dir.glob("trajectory-*.json")) if traj_dir.exists() else []
    ok = any(check_file_exists(f) for f in files)
    return {"name": "trajectories_written", "ok": ok, "count": len(files), "samples": [str(f) for f in files[-3:]]}


def main() -> int:
    tests = [
        test_compile(),
        test_demo(),
        test_cli_desktop_move(),
        test_programmatic_executor_move(),
        test_trajectories_written(),
    ]
    passed = sum(1 for t in tests if t.get("ok"))
    total = len(tests)

    print("=" * 60)
    print("LAM Agent Smoke Tests Summary")
    print("=" * 60)
    for t in tests:
        status = "OK" if t.get("ok") else "FAIL"
        print(f"- {t['name']}: {status}")
        if not t.get("ok"):
            # 簡短輸出錯誤線索
            out = (t.get("out") or "").strip()
            err = (t.get("err") or "").strip()
            if out:
                print(f"  out: {out.splitlines()[-1][:200]}")
            if err:
                print(f"  err: {err.splitlines()[-1][:200]}")
    print("-" * 60)
    print(f"Passed {passed}/{total}")

    # 將詳細結果寫入檔案
    result_path = PROJECT_ROOT / "smoke_results.json"
    result_path.write_text(json.dumps({"results": tests}, indent=2), encoding="utf-8")
    print(f"Details saved to: {result_path}")

    return 0 if passed == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
