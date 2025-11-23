import sys
import json
import struct
from typing import Any, Dict


def set_binary_stdio_on_windows() -> None:
    if sys.platform == "win32":
        import os
        import msvcrt

        msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
        msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)


def read_exact(num_bytes: int) -> bytes:
    data = b""
    while len(data) < num_bytes:
        chunk = sys.stdin.buffer.read(num_bytes - len(data))
        if not chunk:
            return b""
        data += chunk
    return data


def get_message() -> Dict[str, Any] | None:
    raw_length = read_exact(4)
    if len(raw_length) == 0:
        return None

    # Native byte order unsigned 32-bit length
    (message_length,) = struct.unpack("@I", raw_length)
    if message_length == 0 or message_length > 1024 * 1024 * 16:
        # Reject empty or unreasonably large messages (16MB cap here)
        raise ValueError("Invalid message length")

    raw_message = read_exact(message_length)
    if len(raw_message) != message_length:
        raise ValueError("Truncated message payload")

    try:
        return json.loads(raw_message.decode("utf-8"))
    except Exception as exc:
        raise ValueError(f"Invalid JSON: {exc}") from exc


def send_message(message: Dict[str, Any]) -> None:
    encoded = json.dumps(message, ensure_ascii=False).encode("utf-8")
    header = struct.pack("@I", len(encoded))
    sys.stdout.buffer.write(header)
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def analyze_text(payload: Dict[str, Any]) -> Dict[str, Any]:
    text = payload.get("text", "")
    if not isinstance(text, str):
        return {"status": "error", "error": "payload.text must be a string"}

    # Very naive features (placeholder for real analysis)
    indicators = 0
    lower = text.lower()
    if "make $" in lower or "free" in lower or "act now" in lower:
        indicators += 1
    if "http://" in lower or "https://" in lower:
        indicators += 1
    if any(term in lower for term in ("dm for", "follow me", "win big")):
        indicators += 1

    score = min(1.0, indicators / 3.0)
    return {
        "status": "ok",
        "type": "analyze_text",
        "score": score,
        "indicators": indicators,
    }


def handle_message(message: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(message, dict):
        return {"status": "error", "error": "message must be an object"}

    command = message.get("command")
    payload = message.get("payload", {})
    if not isinstance(payload, dict):
        payload = {}

    if command == "ping":
        return {"status": "ok", "type": "pong"}
    if command == "get_status":
        return {"status": "ok", "type": "status", "version": "1.0.0"}
    if command == "analyze_text":
        return analyze_text(payload)

    return {"status": "error", "error": f"unknown command: {command}"}


def main() -> None:
    set_binary_stdio_on_windows()

    while True:
        try:
            msg = get_message()
            if msg is None:
                # Clean EOF
                break
            response = handle_message(msg)
            send_message(response)
        except Exception as exc:
            # Emit structured error and exit to avoid undefined state
            try:
                send_message({"status": "error", "error": str(exc)})
            finally:
                break


if __name__ == "__main__":
    main()


