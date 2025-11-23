"""Quick test of LAM components."""
from ai_agent.control.lam_planner import LAMPlanner
from ai_agent.action.tokenizer import ActionTokenizer
from ai_agent.perception.fusion import UIGraphBuilder
from ai_agent.training.state_action import TrajectoryStore, StateActionPair, Trajectory
from pathlib import Path

print("=" * 60)
print("Testing LAM Components")
print("=" * 60)

# Test 1: Planner
print("\n1. Testing LAM Planner...")
planner = LAMPlanner()
plan = planner.plan("Search for Python tutorials on Google")
print(f"   [OK] Planner created {len(plan)} steps")
for step in plan[:2]:
    print(f"      - {step.get('goal', 'Unknown')[:50]}")

# Test 2: Action Tokenizer
print("\n2. Testing Action Tokenizer...")
tokenizer = ActionTokenizer()
test_action = {
    "kind": "CLICK",
    "target": {"bbox": [100, 200, 50, 50]},
    "input_text": "test"
}
tokens = tokenizer.tokenize(test_action)
print(f"   [OK] Tokenized action: {len(tokens)} tokens")
print(f"      Tokens: {tokens[:3]}...")

# Test 3: UI Graph Builder
print("\n3. Testing UI Graph Builder...")
builder = UIGraphBuilder()
ui_graph = builder.build(
    dom_snapshot={"dom": "<html></html>", "url": "test"},
    vision_elements=[
        {"role": "button", "name": "Search", "bbox": [100, 200, 80, 30]},
        {"role": "input", "name": "Search box", "bbox": [200, 200, 300, 40]},
    ]
)
print(f"   [OK] UI Graph built: {len(ui_graph['nodes'])} nodes, {len(ui_graph['edges'])} edges")

# Test 4: Trajectory Store
print("\n4. Testing Trajectory Store...")
store = TrajectoryStore(Path("test_trajectories"))
trajectory = Trajectory(
    goal="Test goal",
    steps=[
        StateActionPair(
            state={"screenshot": "test.png"},
            action={"kind": "CLICK", "target": {"bbox": [100, 200, 50, 50]}},
            next_state={"url": "result.html"},
            reward=1.0,
        )
    ],
    success=True,
)
saved_path = store.save(trajectory)
print(f"   [OK] Trajectory saved: {saved_path.name}")

# Cleanup
import shutil
if Path("test_trajectories").exists():
    shutil.rmtree("test_trajectories")

print("\n" + "=" * 60)
print("All LAM components working! [OK]")
print("=" * 60)

