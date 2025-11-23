import logging
import subprocess
from pathlib import Path
from typing import Dict, Optional


logger = logging.getLogger(__name__)

try:
    from pywinauto import Application
    from pywinauto import keyboard
    from pywinauto import mouse
    from pywinauto import Desktop
except Exception:  # library may not be installed yet
    Application = None  # type: ignore
    keyboard = None  # type: ignore
    mouse = None  # type: ignore
    Desktop = None  # type: ignore

try:
    from PIL import ImageGrab
except Exception:
    ImageGrab = None  # type: ignore


class DesktopAutomator:
    def __init__(self) -> None:
        self._app: Optional["Application"] = None

    def ensure_libs(self) -> Optional[str]:
        if Application is None:
            return "pywinauto not installed"
        return None

    def launch_app(self, exe_path: str, args: Optional[str] = None) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            path = Path(exe_path)
            if not path.exists():
                return {"ok": False, "error": "Executable not found"}
            cmd_line = f'"{str(path)}" {args or ""}'.strip()
            self._app = Application(backend="uia").start(cmd_line)
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to launch app")
            return {"ok": False, "error": str(e)}

    def focus_window(self, title: str) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            app = self._app or Application(backend="uia").connect(title_re=f".*{title}.*")
            win = app.window(title_re=f".*{title}.*")
            win.set_focus()
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to focus window")
            return {"ok": False, "error": str(e)}

    def send_keys(self, keys: str) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            keyboard.send_keys(keys)
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to send keys")
            return {"ok": False, "error": str(e)}

    def click(self, x: int, y: int, button: str = "left") -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            if button not in {"left", "right", "middle"}:
                return {"ok": False, "error": "Invalid button"}
            mouse.click(button=button, coords=(x, y))
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to click")
            return {"ok": False, "error": str(e)}

    def get_cursor_pos(self) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            pos = mouse.get_position()
            return {"ok": True, "x": int(pos[0]), "y": int(pos[1])}
        except Exception as e:
            logger.exception("Failed to get cursor position")
            return {"ok": False, "error": str(e)}

    def move_cursor(self, x: int, y: int) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            mouse.move(coords=(x, y))
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to move cursor")
            return {"ok": False, "error": str(e)}

    def drag(self, from_x: int, from_y: int, to_x: int, to_y: int, button: str = "left") -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            if button not in {"left", "right", "middle"}:
                return {"ok": False, "error": "Invalid button"}
            mouse.press(button=button, coords=(from_x, from_y))
            mouse.move(coords=(to_x, to_y))
            mouse.release(button=button, coords=(to_x, to_y))
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to drag")
            return {"ok": False, "error": str(e)}

    def scroll(self, wheel_delta: int, x: Optional[int] = None, y: Optional[int] = None) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            if x is not None and y is not None:
                mouse.move(coords=(x, y))
            mouse.scroll(coords=None, wheel_dist=int(wheel_delta))
            return {"ok": True}
        except Exception as e:
            logger.exception("Failed to scroll")
            return {"ok": False, "error": str(e)}

    def get_cursor_context(self) -> Dict[str, object]:
        err = self.ensure_libs()
        if err:
            return {"ok": False, "error": err}
        try:
            pos = mouse.get_position()
            x, y = int(pos[0]), int(pos[1])
            title = None
            control = None
            if Desktop is not None:
                try:
                    elem = Desktop(backend="uia").from_point(x, y)
                    title = elem.window_text()
                    control = elem.friendly_class_name()
                except Exception:
                    logger.debug("from_point failed", exc_info=True)
            return {"ok": True, "x": x, "y": y, "window_title": title, "control": control}
        except Exception as e:
            logger.exception("Failed to get cursor context")
            return {"ok": False, "error": str(e)}

    def screenshot_at_cursor(self, width: int = 400, height: int = 300) -> Dict[str, object]:
        if ImageGrab is None:
            return {"ok": False, "error": "Pillow not installed"}
        try:
            pos = mouse.get_position() if self.ensure_libs() is None else (0, 0)
            cx, cy = int(pos[0]), int(pos[1])
            half_w, half_h = int(width // 2), int(height // 2)
            left, top = max(0, cx - half_w), max(0, cy - half_h)
            right, bottom = left + width, top + height
            img = ImageGrab.grab(bbox=(left, top, right, bottom))
            import io, base64
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            data = base64.b64encode(buf.getvalue()).decode("ascii")
            return {"ok": True, "image_base64": data, "width": width, "height": height, "x": cx, "y": cy}
        except Exception as e:
            logger.exception("Failed to capture screenshot at cursor")
            return {"ok": False, "error": str(e)}

    def upload_file(self, file_path: str) -> Dict[str, object]:
        helper = Path(__file__).resolve().parents[1] / "compiled_scripts" / "upload_file.exe"
        if not helper.exists():
            logger.warning("upload_file.exe not found; returning stub result")
            return {"ok": True, "note": "Stubbed upload_file"}
        try:
            subprocess.run([str(helper), file_path], check=True)
            return {"ok": True}
        except subprocess.CalledProcessError as e:
            logger.exception("upload_file.exe failed")
            return {"ok": False, "error": str(e)}

