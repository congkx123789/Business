"""Quick test script for desktop control."""
import time
from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.control.interactive_planner import InteractivePlanner
from ai_agent.perception.screenshot import capture_screenshot

print("=" * 60)
print("Testing Desktop Control")
print("=" * 60)

# Test planner
planner = InteractivePlanner()
print("\n1. Testing planner...")
plan = planner.plan("move to (500, 300)")
print(f"   Plan created: {plan[0]['goal']}")

# Test executor
print("\n2. Testing executor...")
executor = DesktopExecutor()
print("   Executor initialized (Shift+Esc to stop)")

# Test screenshot
print("\n3. Testing screenshot capture...")
try:
    img_bytes, path = capture_screenshot()
    print(f"   Screenshot captured: {len(img_bytes)} bytes")
except Exception as e:
    print(f"   Screenshot error: {e}")

# Test actual mouse move (safe - just moves, doesn't click)
print("\n4. Testing mouse move (will move in 2 seconds)...")
print("   Moving mouse to (500, 300)...")
time.sleep(2)

action = {
    "action_id": "test-001",
    "kind": "CLICK",
    "target": {"bbox": [499, 299, 2, 2]},
    "meta": {"move_only": True},
}

try:
    result = executor.execute(action)
    print(f"   Result: {result['status']}")
    if "moved_to" in result.get("evidence", {}):
        print(f"   Mouse moved to: {result['evidence']['moved_to']}")
except Exception as e:
    print(f"   Error: {e}")

executor.stop()
print("\n" + "=" * 60)
print("Test complete!")
print("=" * 60)

