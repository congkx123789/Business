from typing import List, Dict, Any


class Planner:
    def __init__(self) -> None:
        pass

    def plan(self, goal: str) -> List[Dict[str, Any]]:
        # Hybrid placeholder: coarse plan then step-wise actions
        return [
            {"id": "step-1", "goal": goal, "pre": [], "post": [], "successCriteria": []}
        ]


