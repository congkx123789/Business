"""Notification system for AI agent status."""
from __future__ import annotations

import platform
from typing import Optional
from datetime import datetime

try:
    if platform.system() == "Windows":
        from win10toast import ToastNotifier
        HAS_WIN10TOAST = True
    else:
        HAS_WIN10TOAST = False
except ImportError:
    HAS_WIN10TOAST = False

try:
    import plyer
    HAS_PLYER = True
except ImportError:
    HAS_PLYER = False


class AgentNotifier:
    """Sends notifications when AI agent starts/stops."""
    
    def __init__(self, enabled: bool = True):
        """Initialize notifier.
        
        Args:
            enabled: Whether notifications are enabled
        """
        self.enabled = enabled
        self.toaster = None
        
        if enabled:
            if platform.system() == "Windows" and HAS_WIN10TOAST:
                try:
                    self.toaster = ToastNotifier()
                    self.method = "win10toast"
                except:
                    self.method = None
            elif HAS_PLYER:
                self.method = "plyer"
            else:
                self.method = None
                print("Warning: No notification library available. Install 'win10toast' (Windows) or 'plyer' (cross-platform)")
        else:
            self.method = None
    
    def notify_start(self, goal: str, mode: str = "desktop") -> None:
        """Send notification when agent starts.
        
        Args:
            goal: The goal the agent is working on
            mode: Agent mode (desktop/web/lam)
        """
        if not self.enabled or not self.method:
            return
        
        title = "🤖 AI Agent Started"
        message = f"Mode: {mode}\nGoal: {goal[:50]}"
        
        self._send_notification(title, message, duration=5)
    
    def notify_stop(self, goal: str, success: bool, steps: int, duration: float) -> None:
        """Send notification when agent stops.
        
        Args:
            goal: The goal that was completed
            success: Whether the goal was achieved
            steps: Number of steps executed
            duration: Duration in seconds
        """
        if not self.enabled or not self.method:
            return
        
        status = "✅ Success" if success else "❌ Failed"
        title = f"🤖 AI Agent Stopped - {status}"
        message = f"Steps: {steps}\nDuration: {duration:.1f}s\nGoal: {goal[:40]}"
        
        self._send_notification(title, message, duration=8)
    
    def notify_error(self, error: str) -> None:
        """Send notification for errors.
        
        Args:
            error: Error message
        """
        if not self.enabled or not self.method:
            return
        
        title = "⚠️ AI Agent Error"
        message = error[:100]
        
        self._send_notification(title, message, duration=10)
    
    def _send_notification(self, title: str, message: str, duration: int = 5) -> None:
        """Send notification using available method.
        
        Args:
            title: Notification title
            message: Notification message
            duration: Duration in seconds
        """
        try:
            if self.method == "win10toast":
                self.toaster.show_toast(
                    title,
                    message,
                    duration=duration,
                    threaded=True
                )
            elif self.method == "plyer":
                plyer.notification.notify(
                    title=title,
                    message=message,
                    timeout=duration
                )
        except Exception as e:
            print(f"Failed to send notification: {e}")


def print_status(message: str, status: str = "INFO") -> None:
    """Print status message with timestamp.
    
    Args:
        message: Status message
        status: Status type (INFO, START, STOP, ERROR)
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    icons = {
        "INFO": "ℹ️",
        "START": "🚀",
        "STOP": "🛑",
        "ERROR": "❌",
        "SUCCESS": "✅"
    }
    icon = icons.get(status, "•")
    print(f"[{timestamp}] {icon} {status}: {message}")

