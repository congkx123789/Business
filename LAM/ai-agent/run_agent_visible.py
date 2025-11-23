"""Run agent with visible output and mouse movement."""
import time
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.control.interactive_planner import InteractivePlanner
from ai_agent.perception.screenshot import capture_screenshot

print("\n" + "=" * 60)
print("AI Agent - Visible Mouse Movement Test")
print("=" * 60)

# Create planner and executor
planner = InteractivePlanner()
executor = DesktopExecutor()

print("\n[1] Planning: move to (500, 300)")
plan = planner.plan("move to (500, 300)")
print(f"    Plan created: {len(plan)} step(s)")

print("\n[2] Getting current mouse position...")
current_pos = executor.get_mouse_position()
print(f"    Current position: ({current_pos.x}, {current_pos.y})")

print("\n[3] Executing mouse move in 2 seconds...")
print("    Watch your screen - the mouse will move!")
for i in range(3, 0, -1):
    print(f"    {i}...")
    time.sleep(1)

# Execute the action
if plan and plan[0].get("kind"):
    action = {
        "action_id": "test-001",
        "kind": plan[0]["kind"],
        "target": plan[0].get("target", {}),
        "input_text": plan[0].get("input_text", ""),
        "meta": plan[0].get("meta", {}),
    }
    
    print("\n[4] Moving mouse now...")
    result = executor.execute(action)
    
    new_pos = executor.get_mouse_position()
    print(f"    New position: ({new_pos.x}, {new_pos.y})")
    print(f"    Status: {result.get('status')}")
    
    if "moved_to" in result.get("evidence", {}):
        moved = result["evidence"]["moved_to"]
        print(f"    Moved to: ({moved[0]}, {moved[1]})")

# Capture screenshot
print("\n[5] Capturing screenshot...")
screenshot_path = Path("test_mouse_move.png")
img_bytes, path = capture_screenshot(screenshot_path)
print(f"    Screenshot saved: {screenshot_path.absolute()}")

# Annotate with mouse position
from ai_agent.action.visual_feedback import annotate_mouse_position
final_pos = executor.get_mouse_position()
annotate_mouse_position(screenshot_path, (final_pos.x, final_pos.y))
print(f"    Screenshot annotated with mouse position marker")

executor.stop()

print("\n" + "=" * 60)
print("Test complete!")
print(f"Check the screenshot: {screenshot_path.absolute()}")
print("You should see a RED circle with YELLOW outline at the mouse position")
print("=" * 60 + "\n")

