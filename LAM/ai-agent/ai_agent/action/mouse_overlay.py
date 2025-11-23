from __future__ import annotations

import logging
import queue
import sys
import threading
from dataclasses import dataclass
from typing import Optional, Tuple

try:
    import tkinter as tk  # type: ignore
except Exception:  # pragma: no cover - tkinter may be unavailable in headless envs
    tk = None  # type: ignore


log = logging.getLogger(__name__)


@dataclass(slots=True)
class OverlayConfig:
    """Configuration for the mouse overlay highlight."""

    radius: int = 22
    outline_width: int = 4
    outline_color: str = "#FFD966"  # soft yellow
    fill_color: str = "#FF6F61"  # coral
    crosshair_color: str = "#FFFFFF"
    refresh_ms: int = 16  # ~60 FPS polling for queue updates
    hide_delay: float = 0.35  # seconds before auto-hiding after flash
    transparent_color: str = "#00FF00"  # chroma key background


class MouseOverlay:
    """Top-most transparent overlay that visually highlights mouse position.

    The overlay spawns a small always-on-top window with a circle and crosshair.
    Calls to :meth:`flash` display the marker briefly, following the cursor.
    """

    def __init__(self, config: Optional[OverlayConfig] = None) -> None:
        self._config = config or OverlayConfig()
        self._queue: "queue.Queue[Tuple[str, Optional[Tuple[int, int]]]]" = queue.Queue()
        self._thread: Optional[threading.Thread] = None
        self._ready = threading.Event()
        self._stop_evt = threading.Event()
        self._visible = False
        self._supported = tk is not None
        self._lock = threading.RLock()
        self._active_flash_timer: Optional[threading.Timer] = None

    @property
    def supported(self) -> bool:
        """Whether the environment supports the overlay (tkinter available)."""

        return self._supported

    def start(self) -> bool:
        """Start the overlay thread (idempotent)."""

        if not self._supported:
            log.debug("Mouse overlay disabled: tkinter not available")
            return False

        with self._lock:
            if self._thread and self._thread.is_alive():
                return True

            self._stop_evt.clear()
            self._ready.clear()
            self._thread = threading.Thread(target=self._run, name="MouseOverlay", daemon=True)
            self._thread.start()

        started = self._ready.wait(timeout=2.0)
        if not started:
            log.warning("Mouse overlay failed to start within timeout")
            self.stop()
        return started

    def stop(self) -> None:
        """Stop the overlay thread and hide the marker."""

        with self._lock:
            if self._active_flash_timer:
                self._active_flash_timer.cancel()
                self._active_flash_timer = None

            if not self._thread:
                return

            if self._thread.is_alive():
                self._queue.put(("stop", None))
                self._stop_evt.set()
                self._thread.join(timeout=1.5)
            self._thread = None
            self._visible = False
            self._ready.clear()

    def show(self) -> None:
        """Show the overlay marker."""

        if not self.start():
            return
        self._queue.put(("show", None))

    def hide(self) -> None:
        """Hide the overlay marker."""

        if not self._thread:
            return
        self._queue.put(("hide", None))

    def move_to(self, position: Tuple[int, int]) -> None:
        """Move the overlay marker to a screen position."""

        if not self._thread:
            return
        self._queue.put(("move", position))

    def flash(self, position: Tuple[int, int], duration: Optional[float] = None) -> None:
        """Move to position, show marker briefly, then auto-hide."""

        duration = duration or self._config.hide_delay
        if not self.start():
            return

        self.move_to(position)
        self.show()
        with self._lock:
            if self._active_flash_timer:
                self._active_flash_timer.cancel()
            self._active_flash_timer = threading.Timer(duration, self.hide)
            self._active_flash_timer.daemon = True
            self._active_flash_timer.start()

    # ------------------------------------------------------------------
    # Tkinter loop implementation
    # ------------------------------------------------------------------
    def _run(self) -> None:  # pragma: no cover - UI loop is hard to unit test
        if tk is None:
            self._ready.set()
            return

        try:
            root = tk.Tk()
        except Exception as exc:  # pragma: no cover
            log.error("Mouse overlay failed to create Tk root: %s", exc)
            self._ready.set()
            return

        cfg = self._config
        diameter = cfg.radius * 2 + cfg.outline_width * 2 + 4
        offset = diameter // 2

        root.withdraw()
        root.overrideredirect(True)
        root.attributes("-topmost", True)
        if sys.platform.startswith("win"):
            try:
                root.wm_attributes("-transparentcolor", cfg.transparent_color)
            except tk.TclError:
                root.attributes("-alpha", 0.0)
        else:
            root.attributes("-alpha", 0.0)
        root.configure(bg=cfg.transparent_color)
        root.geometry(f"{diameter}x{diameter}+0+0")

        canvas = tk.Canvas(
            root,
            width=diameter,
            height=diameter,
            highlightthickness=0,
            bg=cfg.transparent_color,
        )
        canvas.pack()

        circle = canvas.create_oval(
            cfg.outline_width,
            cfg.outline_width,
            diameter - cfg.outline_width,
            diameter - cfg.outline_width,
            outline=cfg.outline_color,
            width=cfg.outline_width,
            fill="" if sys.platform.startswith("win") else cfg.fill_color,
        )
        cross_length = max(6, cfg.radius // 2)
        canvas.create_line(
            offset - cross_length,
            offset,
            offset + cross_length,
            offset,
            fill=cfg.crosshair_color,
            width=2,
        )
        canvas.create_line(
            offset,
            offset - cross_length,
            offset,
            offset + cross_length,
            fill=cfg.crosshair_color,
            width=2,
        )

        self._ready.set()

        def process_queue() -> None:
            try:
                while True:
                    command, payload = self._queue.get_nowait()
                    if command == "show":
                        if not self._visible:
                            if sys.platform.startswith("win"):
                                root.attributes("-alpha", 1.0)
                            root.deiconify()
                            self._visible = True
                    elif command == "hide":
                        if self._visible:
                            root.withdraw()
                            self._visible = False
                    elif command == "move" and payload:
                        x, y = payload
                        x = max(0, int(x) - offset)
                        y = max(0, int(y) - offset)
                        root.geometry(f"{diameter}x{diameter}+{x}+{y}")
                    elif command == "stop":
                        root.withdraw()
                        root.quit()
                        return
            except queue.Empty:
                pass
            finally:
                if not self._stop_evt.is_set():
                    root.after(cfg.refresh_ms, process_queue)

        root.after(cfg.refresh_ms, process_queue)
        try:
            root.mainloop()
        finally:
            self._visible = False
            self._stop_evt.set()
            self._ready.clear()


__all__ = ["MouseOverlay", "OverlayConfig"]
