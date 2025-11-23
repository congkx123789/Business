import logging
from typing import Any, Dict


logger = logging.getLogger(__name__)


class TaskHandler:
    def __init__(self, web_automator: Any, desktop_automator: Any):
        self.web = web_automator
        self.desktop = desktop_automator

    def handle(self, action: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if action == "sample_task":
            # Example orchestrated flow
            message = data.get("message", "")
            logger.info("Running sample_task with message=%s", message)
            return {"ok": True, "echo": message}

        if action == "open_url":
            url = data.get("url")
            if not isinstance(url, str) or not url:
                return {"ok": False, "error": "Invalid 'url'"}
            return self.web.open_url(url)

        if action == "upload_file":
            path = data.get("path")
            if not isinstance(path, str) or not path:
                return {"ok": False, "error": "Invalid 'path'"}
            return self.desktop.upload_file(path)

        # Desktop control actions
        if action == "app_launch":
            exe_path = data.get("exe_path")
            args = data.get("args")
            if not isinstance(exe_path, str) or not exe_path:
                return {"ok": False, "error": "Invalid 'exe_path'"}
            if args is not None and not isinstance(args, (str, int, float)):
                return {"ok": False, "error": "Invalid 'args'"}
            return self.desktop.launch_app(exe_path, str(args) if args is not None else None)

        if action == "app_focus":
            title = data.get("title")
            if not isinstance(title, str) or not title:
                return {"ok": False, "error": "Invalid 'title'"}
            return self.desktop.focus_window(title)

        if action == "app_send_keys":
            keys = data.get("keys")
            if not isinstance(keys, str) or not keys:
                return {"ok": False, "error": "Invalid 'keys'"}
            return self.desktop.send_keys(keys)

        if action == "app_click":
            x, y = data.get("x"), data.get("y")
            button = data.get("button", "left")
            if not isinstance(x, int) or not isinstance(y, int):
                return {"ok": False, "error": "Invalid coordinates"}
            if not isinstance(button, str):
                return {"ok": False, "error": "Invalid 'button'"}
            return self.desktop.click(x, y, button)

        # Cursor control actions
        if action == "cursor_get_pos":
            return self.desktop.get_cursor_pos()

        if action == "cursor_move":
            x, y = data.get("x"), data.get("y")
            if not isinstance(x, int) or not isinstance(y, int):
                return {"ok": False, "error": "Invalid coordinates"}
            return self.desktop.move_cursor(x, y)

        if action == "cursor_drag":
            from_x, from_y = data.get("from_x"), data.get("from_y")
            to_x, to_y = data.get("to_x"), data.get("to_y")
            button = data.get("button", "left")
            if not all(isinstance(v, int) for v in [from_x, from_y, to_x, to_y]):
                return {"ok": False, "error": "Invalid coordinates"}
            if not isinstance(button, str):
                return {"ok": False, "error": "Invalid 'button'"}
            return self.desktop.drag(from_x, from_y, to_x, to_y, button)

        if action == "cursor_scroll":
            wheel_delta = data.get("wheel_delta")
            x, y = data.get("x"), data.get("y")
            if not isinstance(wheel_delta, int):
                return {"ok": False, "error": "Invalid 'wheel_delta'"}
            if (x is not None and not isinstance(x, int)) or (y is not None and not isinstance(y, int)):
                return {"ok": False, "error": "Invalid optional coords"}
            return self.desktop.scroll(wheel_delta, x, y)

        # Agent-at-cursor helpers
        if action == "agent_cursor_context":
            return self.desktop.get_cursor_context()

        if action == "agent_cursor_screenshot":
            width = data.get("width", 400)
            height = data.get("height", 300)
            if not isinstance(width, int) or not isinstance(height, int):
                return {"ok": False, "error": "Invalid size"}
            return self.desktop.screenshot_at_cursor(width, height)

        return {"ok": False, "error": f"Unknown action: {action}"}

