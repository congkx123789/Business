from typing import Dict, Any


class WebExecutor:
    def __init__(self) -> None:
        pass

    def execute(self, action: Dict[str, Any]) -> Dict[str, Any]:
        # Stub: return ok with echo evidence
        return {
            "action_id": action.get("action_id"),
            "status": "ok",
            "evidence": {"note": "web-executor-stub"},
        }


