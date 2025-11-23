import threading
import time
import uuid
from typing import Any, Dict, List


class TaskManager:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._tasks: Dict[str, Dict[str, Any]] = {}

    def create_task(self, meta: Dict[str, Any]) -> str:
        task_id = uuid.uuid4().hex
        payload = {
            "id": task_id,
            "meta": meta,
            "status": "queued",
            "created_at": time.time(),
            "updated_at": time.time(),
            "events": [],
        }
        with self._lock:
            self._tasks[task_id] = payload
        return task_id

    def append_event(self, task_id: str, event: Dict[str, Any]) -> None:
        event.setdefault("timestamp", time.time())
        with self._lock:
            task = self._tasks.get(task_id)
            if not task:
                return
            task["events"].append(event)
            if "status" in event:
                task["status"] = event["status"]
            task["updated_at"] = event["timestamp"]

    def get_recent(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self._lock:
            tasks = list(self._tasks.values())
        tasks.sort(key=lambda item: item["updated_at"], reverse=True)
        return tasks[:limit]


task_manager = TaskManager()
