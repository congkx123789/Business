from typing import Any, Dict, List


class WorkingMemory:
    def __init__(self) -> None:
        self.session: Dict[str, Any] = {}
        self.timeline: List[Dict[str, Any]] = []

    def add_event(self, event: str, payload: Dict[str, Any]) -> None:
        self.timeline.append({"event": event, "payload": payload})


