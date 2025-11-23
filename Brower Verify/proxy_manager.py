from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Proxy:
    server: str
    username: Optional[str] = None
    password: Optional[str] = None


class ProxyManager:
    def __init__(self, sticky: List[Proxy], rotating: List[Proxy]):
        self.sticky = sticky
        self.rotating = rotating
        self._sticky_index = 0
        self._rot_index = 0

    def get_sticky_for_account(self, account_name: str) -> Proxy:
        if not self.sticky:
            raise ValueError("No sticky proxies configured")
        index = hash(account_name) % len(self.sticky)
        return self.sticky[index]

    def get_next_rotating(self) -> Proxy:
        if not self.rotating:
            raise ValueError("No rotating proxies configured")
        proxy = self.rotating[self._rot_index % len(self.rotating)]
        self._rot_index += 1
        return proxy

