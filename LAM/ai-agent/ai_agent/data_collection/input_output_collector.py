"""Comprehensive input/output data collector for AI agent training.

This module captures:
- Keyboard events (all keystrokes, key combinations)
- Mouse events (movements, clicks, scrolls, drags)
- Screen state (screenshots)
- System information (active window, clipboard, etc.)
- Application state (DOM, UI elements)
"""
from __future__ import annotations

import json
import time
import threading
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from collections import deque
import uuid

try:
    from pynput import keyboard, mouse
    from pynput.keyboard import Key, Listener as KeyboardListener
    from pynput.mouse import Button, Listener as MouseListener
    import pyautogui
    import mss
    from PIL import Image
    import psutil
except ImportError as e:
    print(f"Warning: Missing dependency: {e}")
    print("Please install: pip install pynput pyautogui mss pillow psutil")


@dataclass
class KeyboardEvent:
    """Represents a keyboard input event."""
    timestamp: float
    event_type: str  # 'press', 'release', 'combination'
    key: str
    key_code: Optional[int] = None
    modifiers: List[str] = field(default_factory=list)  # ['ctrl', 'shift', 'alt', 'cmd']
    is_special: bool = False  # True for special keys (Ctrl, Shift, etc.)
    text: Optional[str] = None  # The actual text character if applicable


@dataclass
class MouseEvent:
    """Represents a mouse input event."""
    timestamp: float
    event_type: str  # 'move', 'click', 'scroll', 'drag_start', 'drag_end'
    x: int
    y: int
    button: Optional[str] = None  # 'left', 'right', 'middle', None
    scroll_dx: Optional[float] = None
    scroll_dy: Optional[float] = None
    pressed: bool = False  # True if button is currently pressed


@dataclass
class ScreenState:
    """Represents the screen state at a point in time."""
    timestamp: float
    screenshot_path: Optional[str] = None
    screenshot_data: Optional[bytes] = None  # Base64 encoded if needed
    resolution: Dict[str, int] = field(default_factory=lambda: {"width": 0, "height": 0})
    cursor_position: Dict[str, int] = field(default_factory=lambda: {"x": 0, "y": 0})


@dataclass
class SystemState:
    """Represents system state information."""
    timestamp: float
    active_window: Optional[Dict[str, Any]] = None
    clipboard: Optional[str] = None
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None
    running_processes: Optional[List[str]] = None
    network_activity: Optional[Dict[str, Any]] = None


@dataclass
class InputOutputSnapshot:
    """A complete snapshot of inputs and outputs at a point in time."""
    snapshot_id: str
    timestamp: float
    
    # Inputs
    keyboard_events: List[KeyboardEvent] = field(default_factory=list)
    mouse_events: List[MouseEvent] = field(default_factory=list)
    
    # Outputs
    screen_state: Optional[ScreenState] = None
    system_state: Optional[SystemState] = None
    
    # Additional context
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TrainingDataSession:
    """Complete session of collected data for training."""
    session_id: str
    start_time: float
    end_time: Optional[float] = None
    goal: Optional[str] = None
    snapshots: List[InputOutputSnapshot] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        def convert_value(v):
            if isinstance(v, (KeyboardEvent, MouseEvent, ScreenState, SystemState, InputOutputSnapshot)):
                return asdict(v)
            elif isinstance(v, list):
                return [convert_value(item) for item in v]
            elif isinstance(v, dict):
                return {k: convert_value(val) for k, val in v.items()}
            return v
        
        data = asdict(self)
        return convert_value(data)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TrainingDataSession":
        """Create from dictionary."""
        # Convert nested dicts back to dataclasses
        snapshots = []
        for snap_data in data.get("snapshots", []):
            # Reconstruct nested objects
            screen_state = None
            if snap_data.get("screen_state"):
                screen_state = ScreenState(**snap_data["screen_state"])
            
            system_state = None
            if snap_data.get("system_state"):
                system_state = SystemState(**snap_data["system_state"])
            
            keyboard_events = [KeyboardEvent(**ke) for ke in snap_data.get("keyboard_events", [])]
            mouse_events = [MouseEvent(**me) for me in snap_data.get("mouse_events", [])]
            
            snapshots.append(InputOutputSnapshot(
                snapshot_id=snap_data["snapshot_id"],
                timestamp=snap_data["timestamp"],
                keyboard_events=keyboard_events,
                mouse_events=mouse_events,
                screen_state=screen_state,
                system_state=system_state,
                metadata=snap_data.get("metadata", {})
            ))
        
        return cls(
            session_id=data["session_id"],
            start_time=data["start_time"],
            end_time=data.get("end_time"),
            goal=data.get("goal"),
            snapshots=snapshots,
            metadata=data.get("metadata", {})
        )


class InputOutputCollector:
    """Collects all input (keyboard, mouse) and output (screen, system) data."""
    
    def __init__(
        self,
        output_dir: Path,
        capture_screenshots: bool = True,
        screenshot_interval: float = 0.1,  # Capture screenshot every 100ms
        max_events_per_snapshot: int = 100,
        save_screenshots: bool = True
    ):
        """Initialize the collector.
        
        Args:
            output_dir: Directory to save collected data
            capture_screenshots: Whether to capture screenshots
            screenshot_interval: Interval between screenshots in seconds
            max_events_per_snapshot: Maximum events before creating new snapshot
            save_screenshots: Whether to save screenshots to disk
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.screenshot_dir = self.output_dir / "screenshots"
        if save_screenshots:
            self.screenshot_dir.mkdir(exist_ok=True)
        
        self.capture_screenshots = capture_screenshots
        self.screenshot_interval = screenshot_interval
        self.max_events_per_snapshot = max_events_per_snapshot
        self.save_screenshots = save_screenshots
        
        # Event buffers
        self.keyboard_events: deque = deque(maxlen=1000)
        self.mouse_events: deque = deque(maxlen=1000)
        self.current_modifiers: set = set()
        
        # State
        self.is_collecting = False
        self.current_session: Optional[TrainingDataSession] = None
        self.snapshots: List[InputOutputSnapshot] = []
        
        # Listeners
        self.keyboard_listener: Optional[KeyboardListener] = None
        self.mouse_listener: Optional[MouseListener] = None
        
        # Threading
        self.screenshot_thread: Optional[threading.Thread] = None
        self.stop_screenshot = threading.Event()
        
        # Screenshot capture (will be created per-thread)
        self.sct = None
        self.last_screenshot_time = 0
        
        # Mouse drag tracking
        self.mouse_dragging = False
        self.drag_start_pos = None
    
    def _get_key_name(self, key) -> tuple[str, bool]:
        """Get key name and whether it's a special key."""
        try:
            if hasattr(key, 'name'):
                return key.name, True
            elif hasattr(key, 'char') and key.char:
                return key.char, False
            else:
                return str(key), True
        except:
            return str(key), True
    
    def _on_keyboard_press(self, key):
        """Handle keyboard key press."""
        if not self.is_collecting:
            return
        
        key_name, is_special = self._get_key_name(key)
        timestamp = time.time()
        
        # Track modifiers
        if is_special and key_name in ['ctrl_l', 'ctrl_r', 'alt_l', 'alt_r', 'shift_l', 'shift_r', 'cmd', 'cmd_l', 'cmd_r']:
            mod_name = key_name.replace('_l', '').replace('_r', '').replace('cmd', 'ctrl')
            self.current_modifiers.add(mod_name)
        
        event = KeyboardEvent(
            timestamp=timestamp,
            event_type='press',
            key=key_name,
            is_special=is_special,
            modifiers=list(self.current_modifiers),
            text=key.char if hasattr(key, 'char') and key.char else None
        )
        
        self.keyboard_events.append(event)
    
    def _on_keyboard_release(self, key):
        """Handle keyboard key release."""
        if not self.is_collecting:
            return
        
        key_name, is_special = self._get_key_name(key)
        timestamp = time.time()
        
        # Remove modifiers
        if is_special and key_name in ['ctrl_l', 'ctrl_r', 'alt_l', 'alt_r', 'shift_l', 'shift_r', 'cmd', 'cmd_l', 'cmd_r']:
            mod_name = key_name.replace('_l', '').replace('_r', '').replace('cmd', 'ctrl')
            self.current_modifiers.discard(mod_name)
        
        event = KeyboardEvent(
            timestamp=timestamp,
            event_type='release',
            key=key_name,
            is_special=is_special,
            modifiers=list(self.current_modifiers),
            text=key.char if hasattr(key, 'char') and key.char else None
        )
        
        self.keyboard_events.append(event)
    
    def _on_mouse_move(self, x, y):
        """Handle mouse movement."""
        if not self.is_collecting:
            return
        
        timestamp = time.time()
        event = MouseEvent(
            timestamp=timestamp,
            event_type='drag' if self.mouse_dragging else 'move',
            x=x,
            y=y,
            pressed=self.mouse_dragging
        )
        
        self.mouse_events.append(event)
    
    def _on_mouse_click(self, x, y, button, pressed):
        """Handle mouse click."""
        if not self.is_collecting:
            return
        
        timestamp = time.time()
        button_name = button.name if hasattr(button, 'name') else str(button)
        
        if pressed:
            self.mouse_dragging = True
            self.drag_start_pos = (x, y)
            event_type = 'drag_start'
        else:
            self.mouse_dragging = False
            event_type = 'click'
        
        event = MouseEvent(
            timestamp=timestamp,
            event_type=event_type,
            x=x,
            y=y,
            button=button_name,
            pressed=pressed
        )
        
        self.mouse_events.append(event)
    
    def _on_mouse_scroll(self, x, y, dx, dy):
        """Handle mouse scroll."""
        if not self.is_collecting:
            return
        
        timestamp = time.time()
        event = MouseEvent(
            timestamp=timestamp,
            event_type='scroll',
            x=x,
            y=y,
            scroll_dx=dx,
            scroll_dy=dy
        )
        
        self.mouse_events.append(event)
    
    def _capture_screenshot(self) -> Optional[ScreenState]:
        """Capture current screen state."""
        if not self.capture_screenshots:
            return None
        
        try:
            # Create new mss instance each time (mss is thread-local)
            sct = mss.mss()
            
            # Capture screen
            screenshot = sct.grab(sct.monitors[0])
            img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
            
            # Get screen resolution
            resolution = {"width": screenshot.width, "height": screenshot.height}
            
            # Get cursor position
            cursor_pos = pyautogui.position()
            
            # Save screenshot if enabled
            screenshot_path = None
            if self.save_screenshots:
                screenshot_filename = f"screenshot_{int(time.time() * 1000)}.png"
                screenshot_path = str(self.screenshot_dir / screenshot_filename)
                img.save(screenshot_path)
            
            return ScreenState(
                timestamp=time.time(),
                screenshot_path=screenshot_path,
                resolution=resolution,
                cursor_position={"x": cursor_pos.x, "y": cursor_pos.y}
            )
        except Exception as e:
            print(f"Error capturing screenshot: {e}")
            return None
    
    def _capture_system_state(self) -> SystemState:
        """Capture current system state."""
        try:
            # Active window (Windows-specific, can be extended)
            active_window = None
            try:
                import win32gui
                hwnd = win32gui.GetForegroundWindow()
                window_text = win32gui.GetWindowText(hwnd)
                window_rect = win32gui.GetWindowRect(hwnd)
                active_window = {
                    "title": window_text,
                    "rect": window_rect
                }
            except:
                pass
            
            # Clipboard
            clipboard = None
            try:
                import pyperclip
                clipboard = pyperclip.paste()
            except:
                pass
            
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory_percent = psutil.virtual_memory().percent
            
            # Running processes (top 10 by CPU)
            processes = []
            try:
                for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                    try:
                        if proc.info['cpu_percent'] and proc.info['cpu_percent'] > 0:
                            processes.append(proc.info['name'])
                    except:
                        pass
                processes = sorted(set(processes))[:10]
            except:
                pass
            
            return SystemState(
                timestamp=time.time(),
                active_window=active_window,
                clipboard=clipboard,
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                running_processes=processes
            )
        except Exception as e:
            print(f"Error capturing system state: {e}")
            return SystemState(timestamp=time.time())
    
    def _screenshot_loop(self):
        """Background thread for capturing screenshots periodically."""
        while not self.stop_screenshot.is_set():
            current_time = time.time()
            if current_time - self.last_screenshot_time >= self.screenshot_interval:
                if self.is_collecting and self.current_session:
                    # Automatically create snapshots at the screenshot interval
                    # This ensures we capture screen state regularly
                    self.add_snapshot()
                self.last_screenshot_time = current_time
            time.sleep(0.05)  # Small sleep to prevent CPU spinning
    
    def create_snapshot(self) -> InputOutputSnapshot:
        """Create a snapshot of current state with all recent events."""
        snapshot_id = str(uuid.uuid4())
        timestamp = time.time()
        
        # Get recent events
        keyboard_events_list = list(self.keyboard_events)
        mouse_events_list = list(self.mouse_events)
        
        # Clear events (they're now in the snapshot)
        self.keyboard_events.clear()
        self.mouse_events.clear()
        
        # Capture current outputs
        screen_state = self._capture_screenshot()
        system_state = self._capture_system_state()
        
        snapshot = InputOutputSnapshot(
            snapshot_id=snapshot_id,
            timestamp=timestamp,
            keyboard_events=keyboard_events_list,
            mouse_events=mouse_events_list,
            screen_state=screen_state,
            system_state=system_state
        )
        
        return snapshot
    
    def start_collection(self, goal: Optional[str] = None):
        """Start collecting input/output data."""
        if self.is_collecting:
            print("Already collecting. Stop first.")
            return
        
        self.is_collecting = True
        self.current_modifiers.clear()
        self.keyboard_events.clear()
        self.mouse_events.clear()
        
        # Create new session
        self.current_session = TrainingDataSession(
            session_id=str(uuid.uuid4()),
            start_time=time.time(),
            goal=goal
        )
        
        # Start keyboard listener
        self.keyboard_listener = KeyboardListener(
            on_press=self._on_keyboard_press,
            on_release=self._on_keyboard_release
        )
        self.keyboard_listener.start()
        
        # Start mouse listener
        self.mouse_listener = MouseListener(
            on_move=self._on_mouse_move,
            on_click=self._on_mouse_click,
            on_scroll=self._on_mouse_scroll
        )
        self.mouse_listener.start()
        
        # Start screenshot thread
        if self.capture_screenshots:
            self.stop_screenshot.clear()
            self.screenshot_thread = threading.Thread(target=self._screenshot_loop, daemon=True)
            self.screenshot_thread.start()
        
        print(f"Started data collection. Session ID: {self.current_session.session_id}")
        if goal:
            print(f"Goal: {goal}")
    
    def stop_collection(self) -> Optional[TrainingDataSession]:
        """Stop collecting and return the session data."""
        if not self.is_collecting:
            print("Not currently collecting.")
            return None
        
        self.is_collecting = False
        
        # Stop listeners
        if self.keyboard_listener:
            self.keyboard_listener.stop()
            self.keyboard_listener = None
        
        if self.mouse_listener:
            self.mouse_listener.stop()
            self.mouse_listener = None
        
        # Stop screenshot thread
        if self.screenshot_thread:
            self.stop_screenshot.set()
            self.screenshot_thread.join(timeout=1.0)
            self.screenshot_thread = None
        
        # Create final snapshot with any remaining events
        if self.keyboard_events or self.mouse_events:
            final_snapshot = self.create_snapshot()
            self.current_session.snapshots.append(final_snapshot)
        
        # Finalize session
        if self.current_session:
            self.current_session.end_time = time.time()
            session = self.current_session
            self.current_session = None
            
            print(f"Stopped data collection. Collected {len(session.snapshots)} snapshots.")
            return session
        
        return None
    
    def add_snapshot(self):
        """Manually add a snapshot (useful for periodic snapshots)."""
        if not self.is_collecting:
            return
        
        snapshot = self.create_snapshot()
        self.current_session.snapshots.append(snapshot)
    
    def save_session(self, session: Optional[TrainingDataSession] = None) -> Path:
        """Save session to disk."""
        if session is None:
            session = self.current_session
        
        if session is None:
            raise ValueError("No session to save")
        
        filename = f"training_data_{session.session_id}.json"
        file_path = self.output_dir / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(session.to_dict(), f, indent=2, default=str)
        
        print(f"Saved session to: {file_path}")
        return file_path
    
    def load_session(self, filename: str) -> TrainingDataSession:
        """Load a session from disk."""
        file_path = self.output_dir / filename
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return TrainingDataSession.from_dict(data)

