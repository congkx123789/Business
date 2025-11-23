"""Test typing action with visible output."""
import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.control.interactive_planner import InteractivePlanner

print("\n" + "=" * 60)
print("AI Agent - Typing Test")
print("=" * 60)

planner = InteractivePlanner()
executor = DesktopExecutor()

print("\n[1] Planning: type hello world")
plan = planner.plan("type hello world")
print(f"    Plan created: {len(plan)} step(s)")

print("\n[2] Typing will start in 3 seconds...")
print("    Make sure you have a text editor or notepad open!")
for i in range(3, 0, -1):
    print(f"    {i}...")
    time.sleep(1)

if plan and plan[0].get("kind"):
    action = {
        "action_id": "type-test",
        "kind": plan[0]["kind"],
        "input_text": plan[0].get("input_text", ""),
        "meta": {},
        "target": {},
    }
    
    print("\n[3] Typing now...")
    result = executor.execute(action)
    print(f"    Status: {result.get('status')}")
    if "typed" in result.get("evidence", {}):
        print(f"    Typed: {result['evidence']['typed']}")

executor.stop()
print("\n" + "=" * 60)
print("Test complete!")
print("=" * 60 + "\n")

