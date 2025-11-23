"""Screen footprint overlay for visualizing AI agent actions."""
from __future__ import annotations

import logging
import queue
import sys
import threading
import time
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict, Any

try:
    import tkinter as tk  # type: ignore
except Exception:
    tk = None

log = logging.getLogger(__name__)


@dataclass
class FootprintConfig:
    """Configuration for the footprint overlay."""
    
    # Colors for different action types
    move_color: str = "#4A90E2"  # Blue for mouse movement
    click_color: str = "#E74C3C"  # Red for clicks
    type_color: str = "#2ECC71"  # Green for typing
    scroll_color: str = "#F39C12"  # Orange for scrolling
    
    # Line and marker settings
    line_width: int = 2
    marker_radius: int = 8
    click_marker_radius: int = 12
    
    # Fade out settings
    fade_duration: float = 8.0  # seconds before fade starts
    fade_speed: float = 0.05  # alpha reduction per frame
    refresh_ms: int = 16  # ~60 FPS
    
    # Path settings
    max_path_points: int = 1000  # Maximum points to keep in memory
    path_smoothing: bool = True
    
    transparent_color: str = "#00FF00"  # Chroma key background


@dataclass
class FootprintPoint:
    """A single footprint point on screen."""
    x: int
    y: int
    action_type: str  # 'move', 'click', 'type', 'scroll'
    timestamp: float
    alpha: float = 1.0


@dataclass
class FootprintPath:
    """A path segment for mouse movement."""
    points: List[Tuple[int, int]]
    color: str
    timestamp: float
    alpha: float = 1.0


class FootprintTracker:
    """Tracks footprint points and paths."""
    
    def __init__(self, config: Optional[FootprintConfig] = None):
        self.config = config or FootprintConfig()
        self.points: List[FootprintPoint] = []
        self.paths: List[FootprintPath] = []
        self.current_path: List[Tuple[int, int]] = []
        self.last_move_time: float = 0.0
        self.lock = threading.RLock()
    
    def add_point(self, x: int, y: int, action_type: str) -> None:
        """Add a footprint point."""
        with self.lock:
            point = FootprintPoint(
                x=x,
                y=y,
                action_type=action_type,
                timestamp=time.time()
            )
            self.points.append(point)
            
            # Limit points to prevent memory issues
            if len(self.points) > self.config.max_path_points:
                self.points = self.points[-self.config.max_path_points:]
    
    def add_path_segment(self, start: Tuple[int, int], end: Tuple[int, int], color: str) -> None:
        """Add a path segment."""
        with self.lock:
            path = FootprintPath(
                points=[start, end],
                color=color,
                timestamp=time.time()
            )
            self.paths.append(path)
            
            # Limit paths
            if len(self.paths) > self.config.max_path_points // 10:
                self.paths = self.paths[-self.config.max_path_points // 10:]
    
    def start_path(self, x: int, y: int) -> None:
        """Start a new path."""
        with self.lock:
            self.current_path = [(x, y)]
            self.last_move_time = time.time()
    
    def add_to_path(self, x: int, y: int) -> None:
        """Add point to current path."""
        with self.lock:
            if not self.current_path:
                self.current_path = [(x, y)]
            else:
                self.current_path.append((x, y))
            self.last_move_time = time.time()
    
    def end_path(self, color: str) -> None:
        """End current path and add to paths list."""
        with self.lock:
            if len(self.current_path) >= 2:
                path = FootprintPath(
                    points=self.current_path.copy(),
                    color=color,
                    timestamp=time.time()
                )
                self.paths.append(path)
                
                # Limit paths
                if len(self.paths) > self.config.max_path_points // 10:
                    self.paths = self.paths[-self.config.max_path_points // 10:]
            self.current_path = []
    
    def get_all_points(self) -> List[FootprintPoint]:
        """Get all points (thread-safe copy)."""
        with self.lock:
            return self.points.copy()
    
    def get_all_paths(self) -> List[FootprintPath]:
        """Get all paths (thread-safe copy)."""
        with self.lock:
            return self.paths.copy()
    
    def update_fade(self, current_time: float) -> None:
        """Update alpha values for fade effect."""
        with self.lock:
            fade_start_time = current_time - self.config.fade_duration
            
            # Fade points
            for point in self.points:
                if point.timestamp < fade_start_time:
                    point.alpha = max(0.0, point.alpha - self.config.fade_speed)
            
            # Fade paths
            for path in self.paths:
                if path.timestamp < fade_start_time:
                    path.alpha = max(0.0, path.alpha - self.config.fade_speed)
            
            # Remove fully faded items
            self.points = [p for p in self.points if p.alpha > 0.01]
            self.paths = [p for p in self.paths if p.alpha > 0.01]
    
    def clear(self) -> None:
        """Clear all footprints."""
        with self.lock:
            self.points.clear()
            self.paths.clear()
            self.current_path.clear()


class FootprintOverlay:
    """Full-screen transparent overlay for displaying footprints."""
    
    def __init__(self, config: Optional[FootprintConfig] = None) -> None:
        self._config = config or FootprintConfig()
        self._tracker = FootprintTracker(self._config)
        self._queue: queue.Queue[Tuple[str, Optional[Any]]] = queue.Queue()
        self._thread: Optional[threading.Thread] = None
        self._ready = threading.Event()
        self._stop_evt = threading.Event()
        self._visible = False
        self._supported = tk is not None
        self._lock = threading.RLock()
    
    @property
    def supported(self) -> bool:
        """Whether the environment supports the overlay (tkinter available)."""
        return self._supported
    
    @property
    def tracker(self) -> FootprintTracker:
        """Get the footprint tracker."""
        return self._tracker
    
    def start(self) -> bool:
        """Start the overlay thread (idempotent)."""
        if not self._supported:
            log.debug("Footprint overlay disabled: tkinter not available")
            return False
        
        with self._lock:
            if self._thread and self._thread.is_alive():
                return True
            
            self._stop_evt.clear()
            self._ready.clear()
            self._thread = threading.Thread(target=self._run, name="FootprintOverlay", daemon=True)
            self._thread.start()
        
        started = self._ready.wait(timeout=2.0)
        if not started:
            log.warning("Footprint overlay failed to start within timeout")
            self.stop()
        return started
    
    def stop(self) -> None:
        """Stop the overlay thread and clear footprints."""
        with self._lock:
            if not self._thread:
                return
            
            if self._thread.is_alive():
                self._queue.put(("stop", None))
                self._stop_evt.set()
                self._thread.join(timeout=1.5)
            self._thread = None
            self._visible = False
            self._ready.clear()
            self._tracker.clear()
    
    def add_footprint(self, x: int, y: int, action_type: str) -> None:
        """Add a footprint point."""
        if not self._thread:
            return
        self._tracker.add_point(x, y, action_type)
    
    def add_path(self, start: Tuple[int, int], end: Tuple[int, int], color: Optional[str] = None) -> None:
        """Add a path segment."""
        if not self._thread:
            return
        if color is None:
            color = self._config.move_color
        self._tracker.add_path_segment(start, end, color)
    
    def start_path(self, x: int, y: int) -> None:
        """Start a new path."""
        if not self._thread:
            return
        self._tracker.start_path(x, y)
    
    def add_to_path(self, x: int, y: int) -> None:
        """Add point to current path."""
        if not self._thread:
            return
        self._tracker.add_to_path(x, y)
    
    def end_path(self, color: Optional[str] = None) -> None:
        """End current path."""
        if not self._thread:
            return
        if color is None:
            color = self._config.move_color
        self._tracker.end_path(color)
    
    def clear(self) -> None:
        """Clear all footprints."""
        if not self._thread:
            return
        self._tracker.clear()
    
    def _run(self) -> None:
        """Main overlay loop."""
        if tk is None:
            self._ready.set()
            return
        
        try:
            root = tk.Tk()
        except Exception as exc:
            log.error("Footprint overlay failed to create Tk root: %s", exc)
            self._ready.set()
            return
        
        cfg = self._config
        
        # Get screen size
        try:
            import pyautogui
            screen_width, screen_height = pyautogui.size()
        except Exception:
            screen_width, screen_height = 1920, 1080
        
        root.withdraw()
        root.overrideredirect(True)
        root.attributes("-topmost", True)
        
        # Set window size to cover full screen (can't use -fullscreen with overrideredirect)
        root.geometry(f"{screen_width}x{screen_height}+0+0")
        
        if sys.platform.startswith("win"):
            try:
                root.wm_attributes("-transparentcolor", cfg.transparent_color)
            except tk.TclError:
                root.attributes("-alpha", 0.0)
        else:
            root.attributes("-alpha", 0.0)
        
        root.configure(bg=cfg.transparent_color)
        
        canvas = tk.Canvas(
            root,
            width=screen_width,
            height=screen_height,
            highlightthickness=0,
            bg=cfg.transparent_color,
        )
        canvas.pack()
        
        self._ready.set()
        
        def process_queue() -> None:
            try:
                while True:
                    command, payload = self._queue.get_nowait()
                    if command == "stop":
                        root.withdraw()
                        root.quit()
                        return
            except queue.Empty:
                pass
        
        def redraw() -> None:
            """Redraw all footprints."""
            if self._stop_evt.is_set():
                return
            
            canvas.delete("all")
            
            current_time = time.time()
            self._tracker.update_fade(current_time)
            
            # Draw paths
            paths = self._tracker.get_all_paths()
            for path in paths:
                if path.alpha <= 0.01 or len(path.points) < 2:
                    continue
                
                # Convert color to rgba with alpha
                color = self._color_with_alpha(path.color, path.alpha)
                
                # Draw path segments
                for i in range(len(path.points) - 1):
                    x1, y1 = path.points[i]
                    x2, y2 = path.points[i + 1]
                    canvas.create_line(
                        x1, y1, x2, y2,
                        fill=color,
                        width=cfg.line_width,
                        capstyle=tk.ROUND
                    )
            
            # Draw current path
            if self._tracker.current_path and len(self._tracker.current_path) >= 2:
                color = self._color_with_alpha(cfg.move_color, 1.0)
                for i in range(len(self._tracker.current_path) - 1):
                    x1, y1 = self._tracker.current_path[i]
                    x2, y2 = self._tracker.current_path[i + 1]
                    canvas.create_line(
                        x1, y1, x2, y2,
                        fill=color,
                        width=cfg.line_width,
                        capstyle=tk.ROUND
                    )
            
            # Draw points
            points = self._tracker.get_all_points()
            for point in points:
                if point.alpha <= 0.01:
                    continue
                
                # Get color for action type
                if point.action_type == "click":
                    color = cfg.click_color
                    radius = cfg.click_marker_radius
                elif point.action_type == "type":
                    color = cfg.type_color
                    radius = cfg.marker_radius
                elif point.action_type == "scroll":
                    color = cfg.scroll_color
                    radius = cfg.marker_radius
                else:
                    color = cfg.move_color
                    radius = cfg.marker_radius
                
                color = self._color_with_alpha(color, point.alpha)
                
                # Draw circle
                canvas.create_oval(
                    point.x - radius,
                    point.y - radius,
                    point.x + radius,
                    point.y + radius,
                    fill=color,
                    outline="",
                    width=0
                )
                
                # Draw outline
                outline_color = self._color_with_alpha("#FFFFFF", point.alpha * 0.5)
                canvas.create_oval(
                    point.x - radius - 1,
                    point.y - radius - 1,
                    point.x + radius + 1,
                    point.y + radius + 1,
                    outline=outline_color,
                    width=1
                )
            
            # Schedule next redraw
            if not self._stop_evt.is_set():
                root.after(cfg.refresh_ms, redraw)
        
        def update_loop() -> None:
            """Update loop for queue processing."""
            process_queue()
            if not self._stop_evt.is_set():
                root.after(cfg.refresh_ms, update_loop)
        
        # Show window
        if sys.platform.startswith("win"):
            root.attributes("-alpha", 0.9)
        root.deiconify()
        self._visible = True
        
        # Start redraw loop
        root.after(cfg.refresh_ms, redraw)
        root.after(cfg.refresh_ms, update_loop)
        
        try:
            root.mainloop()
        finally:
            self._visible = False
            self._stop_evt.set()
            self._ready.clear()
    
    def _color_with_alpha(self, color: str, alpha: float) -> str:
        """Convert hex color to rgba string with alpha."""
        # Simple approximation: convert hex to rgb and add alpha
        # For tkinter, we'll use a workaround with color intensity
        if color.startswith("#"):
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            # Adjust brightness based on alpha
            r = int(r * alpha)
            g = int(g * alpha)
            b = int(b * alpha)
            return f"#{r:02x}{g:02x}{b:02x}"
        return color


__all__ = ["FootprintOverlay", "FootprintConfig", "FootprintTracker"]
