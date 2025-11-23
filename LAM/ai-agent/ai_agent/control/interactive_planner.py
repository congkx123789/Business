"""Simple interactive planner for desktop commands."""
import re
import uuid
from typing import List, Dict, Any


class InteractivePlanner:
    """Parses simple commands into actions."""
    
    def parse_command(self, command: str) -> List[Dict[str, Any]]:
        """Parse a command string into actions.
        
        Examples:
            "click at (100, 200)"
            "type hello world"
            "scroll down"
            "wait 2 seconds"
            "press ctrl+c"
            "drag from (100,200) to (400,500)"
            "assert cursor near (500,300)"
        """
        command = command.strip().lower()
        actions: List[Dict[str, Any]] = []
        
        # Click at coordinates
        if match := re.match(r"click\s+at\s*\(?\s*(\d+)\s*,\s*(\d+)\s*\)?", command):
            x, y = int(match.group(1)), int(match.group(2))
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "CLICK",
                "target": {"bbox": [x - 5, y - 5, 10, 10]},  # Small bbox around point
                "goal": f"Click at ({x}, {y})",
                "meta": {},
            })
        
        # Type text
        elif command.startswith("type "):
            text = command[5:].strip()
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "TYPE",
                "input_text": text,
                "goal": f"Type: {text[:50]}",
                "meta": {},
            })
        
        # Scroll
        elif "scroll" in command:
            amount = 3
            if "down" in command or "up" in command:
                amount = -3 if "up" in command else 3
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "SCROLL",
                "goal": f"Scroll {'down' if amount > 0 else 'up'}",
                "meta": {"scroll_amount": amount},
            })
        
        # Wait
        elif match := re.match(r"wait\s+(\d+)\s*(?:seconds?|s)?", command):
            seconds = int(match.group(1))
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "WAIT_FOR",
                "goal": f"Wait {seconds} seconds",
                "meta": {"wait_ms": seconds * 1000},
            })
        
        # Hotkey
        elif command.startswith("press ") or command.startswith("hotkey "):
            keys = command.split(" ", 1)[1].strip()
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "HOTKEY",
                "input_text": keys,
                "goal": f"Press {keys}",
                "meta": {},
            })
        
        # Mouse move (not in DSL, but useful)
        elif match := re.match(r"move\s+to\s*\(?\s*(\d+)\s*,\s*(\d+)\s*\)?", command):
            x, y = int(match.group(1)), int(match.group(2))
            # Treat as click without clicking
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "CLICK",
                "target": {"bbox": [x - 1, y - 1, 2, 2]},
                "goal": f"Move to ({x}, {y})",
                "meta": {"move_only": True},
            })
        
        # Drag from (x1,y1) to (x2,y2)
        elif match := re.match(r"drag\s+from\s*\(?\s*(\d+)\s*,\s*(\d+)\s*\)?\s*to\s*\(?\s*(\d+)\s*,\s*(\d+)\s*\)?", command):
            x1, y1, x2, y2 = map(int, match.groups())
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "DRAG",
                "goal": f"Drag from ({x1},{y1}) to ({x2},{y2})",
                "meta": {"from": [x1, y1], "to": [x2, y2]},
            })

        # Assertions: assert cursor near (x,y) [radius optional]
        elif match := re.match(r"assert\s+cursor\s+(?:near|at)\s*\(?\s*(\d+)\s*,\s*(\d+)\s*\)?(?:\s*r(?:=|adius)?\s*(\d+))?", command):
            x, y, r = match.group(1), match.group(2), match.group(3)
            radius = int(r) if r else 5
            actions.append({
                "id": str(uuid.uuid4()),
                "action_id": str(uuid.uuid4()),
                "kind": "ASSERT",
                "goal": f"Assert cursor near ({x}, {y})",
                "meta": {"assert": {"type": "cursor_near", "x": int(x), "y": int(y), "radius": radius}},
            })

        else:
            # Default: try to interpret as goal for future LLM planning
            actions.append({
                "id": str(uuid.uuid4()),
                "goal": command,
                "pre": [],
                "post": [],
                "successCriteria": [],
            })
        
        return actions
    
    def plan(self, goal: str) -> List[Dict[str, Any]]:
        """Plan from a goal string - tries to parse as command first."""
        # Try parsing as command
        actions = self.parse_command(goal)
        if actions and actions[0].get("kind"):
            return actions
        
        # Otherwise return as high-level plan step
        return [
            {
                "id": str(uuid.uuid4()),
                "goal": goal,
                "pre": [],
                "post": [],
                "successCriteria": [],
            }
        ]

