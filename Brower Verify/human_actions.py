import random
import time
from typing import Optional

from playwright.sync_api import Page


def human_like_scroll(page: Page, max_px: int = 1200) -> None:
    current = 0
    while current < max_px:
        step = 50 + int(random.random() * 150)
        page.mouse.wheel(0, step)
        time.sleep(random.uniform(0.05, 0.3))
        current += step


def human_like_type(element, text: str, min_delay: float = 0.05, max_delay: float = 0.2) -> None:
    for ch in text:
        element.type(ch)
        time.sleep(random.uniform(min_delay, max_delay))


def human_like_move_and_click(page: Page, x: Optional[int] = None, y: Optional[int] = None) -> None:
    if x is None or y is None:
        box = page.viewport_size or {"width": 1280, "height": 720}
        x = random.randint(int(box["width"] * 0.2), int(box["width"] * 0.8))
        y = random.randint(int(box["height"] * 0.2), int(box["height"] * 0.8))
    page.mouse.move(x, y, steps=random.randint(5, 25))
    time.sleep(random.uniform(0.05, 0.5))
    page.mouse.click(x, y)

