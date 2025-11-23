"""Desktop executor for Windows - controls mouse and keyboard."""

import logging
import time
import uuid
from typing import Any, Dict, Optional, Union

import pyautogui
import pynput
from pynput import keyboard, mouse

from ai_agent.action.dsl import Action
from ai_agent.action.mouse_overlay import MouseOverlay, OverlayConfig
from ai_agent.action.footprint_overlay import FootprintOverlay, FootprintConfig

# Safety: disable pyautogui failsafe (we'll use our own hotkey)
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.1  # Small delay between actions


class DesktopExecutor:
    """Executes actions on desktop using mouse/keyboard control."""

    def __init__(
        self,
        enable_overlay: bool = True,
        overlay_config: Optional[Union[OverlayConfig, Dict[str, Any]]] = None,
        enable_footprint: bool = True,
        footprint_config: Optional[Union[FootprintConfig, Dict[str, Any]]] = None,
    ) -> None:
        self._log = logging.getLogger(__name__)
        self._stop_requested = False
        self._hotkey_listener: Optional[keyboard.Listener] = None
        self._mouse_listener: Optional[mouse.Listener] = None
        self._overlay: Optional[MouseOverlay] = None
        self._overlay_enabled = False
        self._overlay_config = self._prepare_overlay_config(overlay_config)
        self._footprint: Optional[FootprintOverlay] = None
        self._footprint_enabled = False
        self._footprint_config = self._prepare_footprint_config(footprint_config)
        self._last_mouse_position: Optional[tuple[int, int]] = None

        self._setup_hotkeys()
        if enable_overlay:
            self._init_overlay()
        if enable_footprint:
            self._init_footprint()

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    def _init_overlay(self) -> None:
        """Initialise the optional mouse overlay if supported."""

        try:
            overlay = MouseOverlay(config=self._overlay_config)
        except Exception as exc:  # pragma: no cover - defensive guard
            self._log.warning("Failed to initialise mouse overlay: %s", exc)
            return

        if overlay.start():
            self._overlay = overlay
            self._overlay_enabled = True
        else:
            self._log.info("Mouse overlay unavailable on this environment")

    def _init_footprint(self) -> None:
        """Initialise the optional footprint overlay if supported."""

        try:
            footprint = FootprintOverlay(config=self._footprint_config)
        except Exception as exc:
            self._log.warning("Failed to initialise footprint overlay: %s", exc)
            return

        if footprint.start():
            self._footprint = footprint
            self._footprint_enabled = True
        else:
            self._log.info("Footprint overlay unavailable on this environment")

    def _prepare_overlay_config(
        self, overlay_config: Optional[Union[OverlayConfig, Dict[str, Any]]]
    ) -> Optional[OverlayConfig]:
        if overlay_config is None:
            return None
        if isinstance(overlay_config, OverlayConfig):
            return overlay_config
        if isinstance(overlay_config, dict):
            try:
                return OverlayConfig(**overlay_config)
            except TypeError as exc:
                self._log.warning("Invalid overlay configuration provided: %s", exc)
                return None
        self._log.warning("Unsupported overlay configuration type: %s", type(overlay_config))
        return None

    def _prepare_footprint_config(
        self, footprint_config: Optional[Union[FootprintConfig, Dict[str, Any]]]
    ) -> Optional[FootprintConfig]:
        if footprint_config is None:
            return None
        if isinstance(footprint_config, FootprintConfig):
            return footprint_config
        if isinstance(footprint_config, dict):
            try:
                return FootprintConfig(**footprint_config)
            except TypeError as exc:
                self._log.warning("Invalid footprint configuration provided: %s", exc)
                return None
        self._log.warning("Unsupported footprint configuration type: %s", type(footprint_config))
        return None

    def _setup_hotkeys(self) -> None:
        """Setup hotkey listener for emergency stop (Shift+Esc)."""

        self._shift_pressed = False

        def on_press(key: keyboard.Key | keyboard.KeyCode) -> None:
            try:
                if key in (keyboard.Key.shift_l, keyboard.Key.shift_r):
                    self._shift_pressed = True
                elif key == keyboard.Key.esc and self._shift_pressed:
                    self._stop_requested = True
            except Exception:
                pass

        def on_release(key: keyboard.Key | keyboard.KeyCode) -> None:
            try:
                if key in (keyboard.Key.shift_l, keyboard.Key.shift_r):
                    self._shift_pressed = False
            except Exception:
                pass

        self._hotkey_listener = keyboard.Listener(on_press=on_press, on_release=on_release)
        self._hotkey_listener.start()

    def stop(self) -> None:
        """Stop the executor and related listeners."""

        self._stop_requested = True
        if self._hotkey_listener:
            self._hotkey_listener.stop()
        if self._overlay:
            self._overlay.stop()
            self._overlay_enabled = False
        if self._footprint:
            self._footprint.stop()
            self._footprint_enabled = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def execute(self, action: Union[Action, Dict[str, Any]]) -> Dict[str, Any]:
        """Execute a desktop action."""

        if self._stop_requested:
            return {
                "action_id": action.get("action_id", ""),
                "status": "fatal",
                "evidence": {"error": "Stop requested by user"},
            }

        action_id = action.get("action_id") or str(uuid.uuid4())
        kind = action.get("kind")
        target = action.get("target", {})
        input_text = action.get("input_text", "")
        meta = action.get("meta", {})

        try:
            mouse_before = tuple(pyautogui.position())
            if kind == "CLICK":
                result = self._execute_click(target, action_id, meta)
            elif kind == "DOUBLE_CLICK":
                result = self._execute_double_click(target, action_id, meta)
            elif kind == "RIGHT_CLICK":
                result = self._execute_right_click(target, action_id, meta)
            elif kind == "DRAG":
                result = self._execute_drag(target, action_id, meta)
            elif kind == "TYPE":
                result = self._execute_type(input_text, action_id, meta)
            elif kind == "SCROLL":
                result = self._execute_scroll(target, action_id, meta)
            elif kind == "HOTKEY":
                result = self._execute_hotkey(input_text, action_id, meta)
            elif kind == "WAIT_FOR":
                result = self._execute_wait(meta, action_id)
            elif kind == "ASSERT":
                result = self._execute_assert(meta, action_id)
            else:
                result = {
                    "action_id": action_id,
                    "status": "fatal",
                    "evidence": {"error": f"Unsupported action kind: {kind}"},
                }

            try:
                mouse_after = tuple(pyautogui.position())
                if isinstance(result, dict):
                    evidence = result.setdefault("evidence", {})
                    evidence.setdefault("mouse_before", list(mouse_before))
                    evidence.setdefault("mouse_after", list(mouse_after))
                    evidence.setdefault("overlay_active", bool(self._overlay_enabled))
                    evidence.setdefault("footprint_active", bool(self._footprint_enabled))
            except Exception:
                pass

            return result

        except Exception as exc:
            return {
                "action_id": action_id,
                "status": "retryable_error",
                "evidence": {"error": str(exc), "screenshot_path": None},
            }

    def get_mouse_position(self) -> tuple[int, int]:
        """Get current mouse position."""

        pos = pyautogui.position()
        return (pos.x, pos.y)

    # ------------------------------------------------------------------
    # Action implementations
    # ------------------------------------------------------------------
    def _execute_click(
        self, target: Dict[str, Any], action_id: str, meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a click action."""

        if meta.get("move_only"):
            bbox = target.get("bbox")
            if bbox and len(bbox) >= 4:
                x = int(bbox[0] + bbox[2] / 2)
                y = int(bbox[1] + bbox[3] / 2)
                self._flash_overlay((x, y))
                self._record_footprint("move", (x, y))
                pyautogui.moveTo(x, y)
                return {
                    "action_id": action_id,
                    "status": "ok",
                    "evidence": {"moved_to": [x, y]},
                }

        bbox = target.get("bbox")
        if bbox and len(bbox) >= 4:
            x = int(bbox[0] + bbox[2] / 2)
            y = int(bbox[1] + bbox[3] / 2)
            self._flash_overlay((x, y))
            self._record_footprint("click", (x, y))
            pyautogui.click(x, y)
            time.sleep(0.2)
            return {
                "action_id": action_id,
                "status": "ok",
                "evidence": {"clicked_at": [x, y], "bbox": bbox},
            }

        name = target.get("name")
        if name:
            return {
                "action_id": action_id,
                "status": "retryable_error",
                "evidence": {
                    "error": "Click requires bbox coordinates or screenshot matching",
                    "target_name": name,
                },
            }
        return {
            "action_id": action_id,
            "status": "retryable_error",
            "evidence": {"error": "Click target missing bbox or name"},
        }

    def _execute_double_click(
        self, target: Dict[str, Any], action_id: str, meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        bbox = target.get("bbox")
        if bbox and len(bbox) >= 4:
            x = int(bbox[0] + bbox[2] / 2)
            y = int(bbox[1] + bbox[3] / 2)
            self._flash_overlay((x, y))
            self._record_footprint("click", (x, y))
            pyautogui.doubleClick(x, y)
            time.sleep(0.2)
            return {
                "action_id": action_id,
                "status": "ok",
                "evidence": {"double_clicked_at": [x, y], "bbox": bbox},
            }
        return {
            "action_id": action_id,
            "status": "retryable_error",
            "evidence": {"error": "Double-click target missing bbox"},
        }

    def _execute_right_click(
        self, target: Dict[str, Any], action_id: str, meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        bbox = target.get("bbox")
        if bbox and len(bbox) >= 4:
            x = int(bbox[0] + bbox[2] / 2)
            y = int(bbox[1] + bbox[3] / 2)
            self._flash_overlay((x, y))
            self._record_footprint("click", (x, y))
            pyautogui.click(x, y, button="right")
            time.sleep(0.2)
            return {
                "action_id": action_id,
                "status": "ok",
                "evidence": {"right_clicked_at": [x, y], "bbox": bbox},
            }
        return {
            "action_id": action_id,
            "status": "retryable_error",
            "evidence": {"error": "Right-click target missing bbox"},
        }

    def _execute_drag(
        self, target: Dict[str, Any], action_id: str, meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a drag action from start to end coordinates."""

        start = meta.get("from")
        end = meta.get("to")
        if not start:
            bbox = target.get("bbox")
            if bbox and len(bbox) >= 4:
                start = [bbox[0] + bbox[2] / 2, bbox[1] + bbox[3] / 2]
        if not start or not end:
            return {
                "action_id": action_id,
                "status": "retryable_error",
                "evidence": {
                    "error": "Drag requires 'from' and 'to' coordinates or bbox+to",
                },
            }

        start_pos = (int(start[0]), int(start[1]))
        end_pos = (int(end[0]), int(end[1]))
        self._flash_overlay(start_pos)
        self._record_footprint("move", start_pos)
        pyautogui.moveTo(start[0], start[1])
        pyautogui.dragTo(
            end[0],
            end[1],
            duration=max(0.0, float(meta.get("duration", 0.2))),
        )
        self._flash_overlay(end_pos)
        self._record_footprint("move", end_pos, path_start=start_pos)
        time.sleep(0.1)
        return {
            "action_id": action_id,
            "status": "ok",
            "evidence": {"drag_from": start, "drag_to": end},
        }

    def _execute_type(self, input_text: str, action_id: str, meta: Dict[str, Any]) -> Dict[str, Any]:
        if not input_text:
            return {
                "action_id": action_id,
                "status": "retryable_error",
                "evidence": {"error": "No input_text provided"},
            }

        # Record typing position (current mouse position)
        current_pos = pyautogui.position()
        self._record_footprint("type", (current_pos.x, current_pos.y))
        pyautogui.write(input_text, interval=float(meta.get("interval", 0.05)))
        time.sleep(0.2)
        return {
            "action_id": action_id,
            "status": "ok",
            "evidence": {"typed": input_text[:50]},  # Truncate for logging
        }

    def _execute_scroll(
        self, target: Dict[str, Any], action_id: str, meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        scroll_amount = int(meta.get("scroll_amount", 3))
        # Record scroll position (current mouse position)
        current_pos = pyautogui.position()
        self._record_footprint("scroll", (current_pos.x, current_pos.y))
        pyautogui.scroll(scroll_amount)
        time.sleep(0.2)
        return {
            "action_id": action_id,
            "status": "ok",
            "evidence": {"scroll_amount": scroll_amount},
        }

    def _execute_hotkey(self, input_text: str, action_id: str, meta: Dict[str, Any]) -> Dict[str, Any]:
        if not input_text:
            return {
                "action_id": action_id,
                "status": "retryable_error",
                "evidence": {"error": "No hotkey specified"},
            }

        keys = [token.strip() for token in input_text.lower().split("+") if token.strip()]
        if not keys:
            return {
                "action_id": action_id,
                "status": "retryable_error",
                "evidence": {"error": "Hotkey string could not be parsed"},
            }
        pyautogui.hotkey(*keys)
        time.sleep(0.2)
        return {
            "action_id": action_id,
            "status": "ok",
            "evidence": {"hotkey": input_text},
        }

    def _execute_wait(self, meta: Dict[str, Any], action_id: str) -> Dict[str, Any]:
        wait_ms = int(meta.get("wait_ms", 1000))
        time.sleep(wait_ms / 1000.0)
        return {
            "action_id": action_id,
            "status": "ok",
            "evidence": {"waited_ms": wait_ms},
        }

    def _execute_assert(self, meta: Dict[str, Any], action_id: str) -> Dict[str, Any]:
        spec = meta.get("assert") or meta.get("assert_") or {}
        a_type = spec.get("type")
        if a_type == "cursor_near":
            x = spec.get("x")
            y = spec.get("y")
            radius = int(spec.get("radius", 5))
            if x is None or y is None:
                return {
                    "action_id": action_id,
                    "status": "retryable_error",
                    "evidence": {"error": "cursor_near requires x,y"},
                }
            pos = pyautogui.position()
            dx = pos.x - int(x)
            dy = pos.y - int(y)
            dist_ok = (dx * dx + dy * dy) ** 0.5 <= radius
            return {
                "action_id": action_id,
                "status": "ok" if dist_ok else "retryable_error",
                "evidence": {
                    "assert": spec,
                    "cursor": [pos.x, pos.y],
                    "assert_passed": bool(dist_ok),
                },
            }
        return {
            "action_id": action_id,
            "status": "retryable_error",
            "evidence": {"error": f"Unsupported assert type: {a_type}"},
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _flash_overlay(self, position: Optional[tuple[float, float]]) -> None:
        if not self._overlay or not position:
            return
        try:
            self._overlay.flash((int(position[0]), int(position[1])))
        except Exception as exc:  # pragma: no cover - best effort visual aid
            self._log.debug("Mouse overlay flash failed: %s", exc)

    def _record_footprint(
        self, 
        action_type: str, 
        position: tuple[int, int], 
        path_start: Optional[tuple[int, int]] = None
    ) -> None:
        """Record a footprint for an action."""
        if not self._footprint or not position:
            return
        
        x, y = position
        
        try:
            # Track mouse movement paths
            if action_type == "move":
                if self._last_mouse_position:
                    # Add path segment from last position to current
                    start_x, start_y = self._last_mouse_position
                    self._footprint.add_path((start_x, start_y), (x, y))
                else:
                    # Start new path
                    self._footprint.start_path(x, y)
            else:
                # For non-move actions, end current path if exists
                if action_type == "click":
                    self._footprint.end_path()
                    self._footprint.add_footprint(x, y, "click")
                elif action_type == "type":
                    self._footprint.end_path()
                    self._footprint.add_footprint(x, y, "type")
                elif action_type == "scroll":
                    self._footprint.end_path()
                    self._footprint.add_footprint(x, y, "scroll")
            
            self._last_mouse_position = position
        except Exception as exc:
            self._log.debug("Footprint recording failed: %s", exc)


__all__ = ["DesktopExecutor"]
