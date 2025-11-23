import json
import logging
import struct
import sys
from typing import Any, Dict

from modules.desktop_automator import DesktopAutomator
from modules.task_handler import TaskHandler
from modules.utils import configure_logging, load_settings
from modules.web_automator import WebAutomator


def read_message() -> Dict[str, Any] | None:
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        return None
    (message_length,) = struct.unpack("<I", raw_length)
    message = sys.stdin.buffer.read(message_length)
    return json.loads(message.decode("utf-8"))


def send_message(msg: Dict[str, Any]) -> None:
    encoded = json.dumps(msg, ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def validate_request(payload: Dict[str, Any]) -> tuple[bool, str | None]:
    if not isinstance(payload, dict):
        return False, "Payload must be a JSON object"
    if payload.get("type") != "automation_request":
        return False, "Invalid 'type'"
    action = payload.get("action")
    if not isinstance(action, str) or not action:
        return False, "Missing or invalid 'action'"
    data = payload.get("data", {})
    if data is None:
        return False, "'data' cannot be null"
    if not isinstance(data, dict):
        return False, "'data' must be an object"
    return True, None


def main() -> None:
    configure_logging()
    logger = logging.getLogger("native_host")
    settings = load_settings()
    logger.info("Native host starting")

    web = WebAutomator()
    desktop = DesktopAutomator()
    handler = TaskHandler(web, desktop)

    while True:
        try:
            payload = read_message()
            if payload is None:
                logger.info("stdin closed; exiting")
                return

            ok, error = validate_request(payload)
            if not ok:
                send_message({"ok": False, "error": error})
                continue

            action = payload["action"]
            data = payload.get("data", {})
            result = handler.handle(action, data)
            send_message(result if isinstance(result, dict) else {"ok": True, "result": result})
        except Exception:
            logger.exception("Unhandled error while processing message")
            send_message({"ok": False, "error": "internal_error"})


if __name__ == "__main__":
    main()

