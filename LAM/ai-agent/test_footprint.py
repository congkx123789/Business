"""Test script for footprint overlay functionality."""
import time
from ai_agent.action.desktop_executor import DesktopExecutor
from ai_agent.action.footprint_overlay import FootprintConfig

print("=" * 60)
print("Testing Footprint Overlay")
print("=" * 60)

# Create executor with footprint enabled
config = FootprintConfig(
    move_color="#4A90E2",  # Blue
    click_color="#E74C3C",  # Red
    type_color="#2ECC71",  # Green
    scroll_color="#F39C12",  # Orange
    fade_duration=5.0,  # Fade after 5 seconds
)

executor = DesktopExecutor(
    enable_footprint=True,
    footprint_config=config,
    enable_overlay=True,
)

print("\nFootprint overlay enabled:", executor._footprint_enabled)
print("Mouse overlay enabled:", executor._overlay_enabled)

# Test various actions
print("\n1. Moving mouse...")
action1 = {
    "action_id": "test1",
    "kind": "CLICK",
    "target": {"bbox": [100, 100, 10, 10]},
    "meta": {"move_only": True}
}
result1 = executor.execute(action1)
print(f"   Result: {result1['status']}")

time.sleep(0.5)

print("\n2. Clicking...")
action2 = {
    "action_id": "test2",
    "kind": "CLICK",
    "target": {"bbox": [500, 300, 10, 10]}
}
result2 = executor.execute(action2)
print(f"   Result: {result2['status']}")

time.sleep(0.5)

print("\n3. Typing...")
action3 = {
    "action_id": "test3",
    "kind": "TYPE",
    "input_text": "Hello"
}
result3 = executor.execute(action3)
print(f"   Result: {result3['status']}")

time.sleep(0.5)

print("\n4. Scrolling...")
action4 = {
    "action_id": "test4",
    "kind": "SCROLL",
    "target": {},
    "meta": {"scroll_amount": 3}
}
result4 = executor.execute(action4)
print(f"   Result: {result4['status']}")

print("\nFootprints should be visible on screen!")
print("They will fade out after 5 seconds.")
print("\nWaiting 8 seconds to see fade effect...")
time.sleep(8)

print("\nStopping executor...")
executor.stop()

print("\nTest completed!")
print("=" * 60)

