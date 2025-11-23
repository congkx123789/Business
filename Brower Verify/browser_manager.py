import os
import logging
from typing import Dict, Optional, Tuple

from playwright.sync_api import Browser, BrowserContext, Playwright, sync_playwright

from proxy_manager import Proxy


class BrowserManager:
    def __init__(self, config: Dict):
        self.config = config

    def launch_context_for_account(
        self,
        proxy: Optional[Proxy],
        ua_profile: Dict,
        storage_state_path: Optional[str] = None,
        storage_state: Optional[Dict] = None,
        headless: Optional[bool] = None,
    ) -> Tuple[Playwright, Browser, BrowserContext]:
        options = {}
        if proxy:
            options["proxy"] = {"server": proxy.server}
            # Chromium 不支持 SOCKS5 代理认证；若配置为 socks5 且带凭据，忽略凭据以避免启动失败
            if proxy.server.lower().startswith("socks5"):
                if proxy.username or proxy.password:
                    logging.getLogger(__name__).warning(
                        "SOCKS5 proxy auth is not supported by Chromium; ignoring username/password for %s",
                        proxy.server,
                    )
            else:
                if proxy.username and proxy.password:
                    options["proxy"].update({"username": proxy.username, "password": proxy.password})

        # 解析 headless 值：显式参数优先，否则使用配置项，默认为 False
        headless_value = False
        if headless is not None:
            headless_value = headless
        else:
            headless_value = bool(self.config.get("headless", False))

        playwright = sync_playwright().start()
        browser = playwright.chromium.launch(headless=headless_value, **options)

        context_args = {
            "user_agent": ua_profile.get("ua"),
            "locale": ua_profile.get("locale"),
            "timezone_id": ua_profile.get("timezone"),
            "java_script_enabled": True,
        }

        # 优先使用内存字典的 storage_state；否则回退到文件路径
        if storage_state is not None:
            context_args["storage_state"] = storage_state
        elif storage_state_path and os.path.exists(storage_state_path):
            context_args["storage_state"] = storage_state_path

        context = browser.new_context(**context_args)
        return playwright, browser, context

