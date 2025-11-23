"""Test input/output understanding functionality."""
from ai_agent.understanding.input_parser import InputParser
from ai_agent.understanding.output_analyzer import OutputAnalyzer
from rich.console import Console
from rich.table import Table

console = Console()

print("=" * 60)
print("Testing Input/Output Understanding")
print("=" * 60)

# Test Input Parser
print("\n1. Testing Input Parser...")
parser = InputParser()

test_inputs = [
    "click on the button",
    "type hello world",
    "move to (500, 300)",
    "scroll down",
    "wait 2 seconds",
    "go to https://example.com",
    "打开浏览器",
    "输入用户名",
]

table = Table(title="Input Parsing Results")
table.add_column("Input", style="cyan")
table.add_column("Intent", style="yellow")
table.add_column("Action", style="green")
table.add_column("Confidence", style="magenta")

for user_input in test_inputs:
    parsed = parser.parse(user_input)
    table.add_row(
        user_input,
        parsed.intent_type,
        parsed.action_kind or "-",
        f"{parsed.confidence:.2f}"
    )

console.print(table)

# Test Output Analyzer
print("\n2. Testing Output Analyzer...")
analyzer = OutputAnalyzer()

# Simulate execution results
test_observations = [
    {
        "status": "ok",
        "evidence": {"clicked_at": [100, 200]}
    },
    {
        "status": "ok",
        "evidence": {"typed": "hello"}
    },
    {
        "status": "retryable_error",
        "evidence": {"error": "Element not found"}
    },
]

results = []
for obs in test_observations:
    result = analyzer.analyze_execution(obs)
    results.append(result)

table2 = Table(title="Output Analysis Results")
table2.add_column("Status", style="cyan")
table2.add_column("Success", style="yellow")
table2.add_column("Confidence", style="green")
table2.add_column("Changes", style="magenta")

for result in results:
    table2.add_row(
        result.status,
        "Yes" if result.success else "No",
        f"{result.confidence:.2f}",
        "Yes" if result.changes_detected else "No"
    )

console.print(table2)

# Test goal achievement understanding
print("\n3. Testing Goal Achievement Understanding...")
goal = "click on the submit button"
achievement = analyzer.understand_goal_achievement(goal, results)

console.print(f"Goal: {goal}")
console.print(f"Achieved: {achievement['achieved']}")
console.print(f"Confidence: {achievement['confidence']:.2f}")
console.print(f"Reason: {achievement.get('reason', 'N/A')}")

# Test summary
print("\n4. Testing Execution Summary...")
summary = analyzer.summarize_execution(results)
console.print(f"Summary: {summary}")

print("\n" + "=" * 60)
print("All understanding tests completed!")
print("=" * 60)

