"""Test visual feedback - create a screenshot and annotate mouse position."""
from pathlib import Path
from ai_agent.perception.screenshot import capture_screenshot
from ai_agent.action.visual_feedback import annotate_mouse_position, annotate_mouse_path
from ai_agent.action.desktop_executor import DesktopExecutor

print("=" * 60)
print("Testing Visual Feedback")
print("=" * 60)

# Create test directory
test_dir = Path("test_visual_feedback")
test_dir.mkdir(exist_ok=True)

# Capture a screenshot
screenshot_path = test_dir / "test_screenshot.png"
print(f"\n1. Capturing screenshot: {screenshot_path}")
img_bytes, path = capture_screenshot(screenshot_path)
print(f"   Screenshot captured: {len(img_bytes)} bytes")

# Get current mouse position
executor = DesktopExecutor()
mouse_pos = executor.get_mouse_position()
print(f"\n2. Current mouse position: {mouse_pos}")

# Annotate screenshot with mouse position
print(f"\n3. Annotating screenshot with mouse position...")
success = annotate_mouse_position(
    screenshot_path,
    mouse_pos,
    color="red",
    outline_color="yellow",
    radius=20
)
if success:
    print(f"   [OK] Screenshot annotated successfully!")
    print(f"   View: {screenshot_path.absolute()}")
else:
    print(f"   [FAIL] Annotation failed")

# Test mouse path annotation (if we have two positions)
print(f"\n4. Testing path annotation...")
start_pos = (100, 100)
end_pos = (500, 300)
success = annotate_mouse_path(
    screenshot_path,
    start_pos,
    end_pos,
    color="blue",
    width=3
)
if success:
    print(f"   [OK] Path annotation added!")
    print(f"   View: {screenshot_path.absolute()}")

executor.stop()
print("\n" + "=" * 60)
print("Test complete! Check the screenshot to see visual markers.")
print("=" * 60)

