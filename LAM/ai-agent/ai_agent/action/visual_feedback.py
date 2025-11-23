"""Visual feedback for mouse movements - annotate screenshots with mouse position."""
from pathlib import Path
from typing import Optional, Tuple

try:
    from PIL import Image, ImageDraw
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


def annotate_mouse_position(
    screenshot_path: Path,
    mouse_pos: Tuple[int, int],
    color: str = "red",
    outline_color: str = "yellow",
    radius: int = 15,
    outline_width: int = 3,
) -> bool:
    """Add a colored circle marker at mouse position on screenshot.
    
    Args:
        screenshot_path: Path to screenshot image
        mouse_pos: (x, y) mouse position
        color: Fill color (default: red)
        outline_color: Outline color (default: yellow)
        radius: Circle radius in pixels
        outline_width: Outline width in pixels
    
    Returns:
        True if annotation succeeded, False otherwise
    """
    if not HAS_PIL:
        return False
    
    if not screenshot_path.exists():
        return False
    
    try:
        # Open image
        img = Image.open(screenshot_path)
        draw = ImageDraw.Draw(img)
        
        x, y = mouse_pos
        
        # Draw circle at mouse position
        # Coordinates: [left, top, right, bottom]
        draw.ellipse(
            [x - radius, y - radius, x + radius, y + radius],
            fill=color,
            outline=outline_color,
            width=outline_width
        )
        
        # Draw a small crosshair in the center
        draw.line([x - 5, y, x + 5, y], fill=outline_color, width=2)
        draw.line([x, y - 5, x, y + 5], fill=outline_color, width=2)
        
        # Save annotated image (overwrite original)
        img.save(screenshot_path)
        return True
    
    except Exception as e:
        print(f"Visual feedback error: {e}")
        return False


def annotate_mouse_path(
    screenshot_path: Path,
    start_pos: Tuple[int, int],
    end_pos: Tuple[int, int],
    color: str = "blue",
    width: int = 2,
) -> bool:
    """Draw a line showing mouse movement path.
    
    Args:
        screenshot_path: Path to screenshot image
        start_pos: (x, y) start position
        end_pos: (x, y) end position
        color: Line color
        width: Line width in pixels
    
    Returns:
        True if annotation succeeded, False otherwise
    """
    if not HAS_PIL:
        return False
    
    if not screenshot_path.exists():
        return False
    
    try:
        img = Image.open(screenshot_path)
        draw = ImageDraw.Draw(img)
        
        # Draw line from start to end
        draw.line([start_pos[0], start_pos[1], end_pos[0], end_pos[1]], 
                 fill=color, width=width)
        
        # Mark start position (green)
        draw.ellipse(
            [start_pos[0] - 8, start_pos[1] - 8, start_pos[0] + 8, start_pos[1] + 8],
            fill="green",
            outline="white",
            width=2
        )
        
        # Mark end position (red)
        draw.ellipse(
            [end_pos[0] - 8, end_pos[1] - 8, end_pos[0] + 8, end_pos[1] + 8],
            fill="red",
            outline="yellow",
            width=2
        )
        
        img.save(screenshot_path)
        return True
    
    except Exception as e:
        print(f"Path annotation error: {e}")
        return False

