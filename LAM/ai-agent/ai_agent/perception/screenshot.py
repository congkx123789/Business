"""Screenshot capture for desktop."""
import time
from pathlib import Path
from typing import Optional
import mss
import mss.tools


def capture_screenshot(save_path: Optional[Path] = None) -> tuple[bytes, Path]:
    """Capture screenshot and optionally save to disk."""
    with mss.mss() as sct:
        # Capture entire screen
        monitor = sct.monitors[1]  # Primary monitor
        screenshot = sct.grab(monitor)
        
        img_bytes = mss.tools.to_png(screenshot.rgb, screenshot.size)
        
        if save_path:
            save_path.parent.mkdir(parents=True, exist_ok=True)
            save_path.write_bytes(img_bytes)
        
        return img_bytes, save_path or Path(f"screenshot-{int(time.time())}.png")

