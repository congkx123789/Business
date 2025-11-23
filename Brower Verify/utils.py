import asyncio
import logging
import random
import time
from urllib.parse import urlparse

import httpx


logger = logging.getLogger(__name__)


def random_delay(min_s: float = 0.5, max_s: float = 2.5) -> None:
    delay = random.uniform(min_s, max_s)
    logger.debug(f"Sleeping for {delay:.2f}s")
    time.sleep(delay)


async def async_random_delay(min_s: float = 0.2, max_s: float = 1.5) -> None:
    delay = random.uniform(min_s, max_s)
    logger.debug(f"Async sleeping for {delay:.2f}s")
    await asyncio.sleep(delay)


def exponential_backoff(attempt: int) -> None:
    base = 1.5
    cap = 60
    sleep = min(cap, base ** attempt + random.uniform(0, 1))
    logger.info(f"Backoff sleeping {sleep:.1f}s for attempt {attempt}")
    time.sleep(sleep)


def is_allowed_by_robots(url: str, user_agent: str = "*") -> bool:
    try:
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        response = httpx.get(robots_url, timeout=10)
        if response.status_code == 200:
            from urllib import robotparser

            parser = robotparser.RobotFileParser()
            parser.parse(response.text.splitlines())
            return parser.can_fetch(user_agent, url)
        return True
    except Exception:
        logger.exception("robots check failed")
        return False

