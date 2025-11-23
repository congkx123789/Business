import argparse
import logging
from pathlib import Path
from typing import Tuple, List, Optional, Sequence, Callable, Dict, Any

import yaml

from browser_manager import BrowserManager
from human_actions import human_like_move_and_click, human_like_scroll
from proxy_manager import Proxy, ProxyManager
from utils import exponential_backoff, is_allowed_by_robots, random_delay
from db import get_storage_state, save_storage_state


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


ProgressCallback = Optional[Callable[[Dict[str, Any]], None]]


def load_config(path: str = "config.yml") -> dict:
    with open(path, "r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def build_proxies(cfg: dict) -> Tuple[list[Proxy], list[Proxy]]:
    sticky = [Proxy(**item) for item in cfg.get("proxies", {}).get("sticky", [])]
    rotating = [Proxy(**item) for item in cfg.get("proxies", {}).get("rotating_pool", [])]
    return sticky, rotating


def _emit(cb: ProgressCallback, event: Dict[str, Any]) -> None:
    if cb:
        cb(event)


def _run_tab_sequence(page, target: str, actions: dict, cb: ProgressCallback, account: str, tab_index: int) -> None:
    _emit(cb, {"type": "tab_navigate", "account": account, "tab": tab_index, "target": target, "status": "running"})
    page.goto(target, timeout=60000)
    if actions.get("scroll", True):
        random_delay(*actions.get("pre_scroll_delay", (0.5, 1.5)))
        human_like_scroll(page, max_px=actions.get("scroll_px", 800))
    if actions.get("click", True):
        random_delay(*actions.get("pre_click_delay", (0.2, 0.6)))
        human_like_move_and_click(page)
    _emit(cb, {"type": "tab_complete", "account": account, "tab": tab_index, "target": target, "status": "done"})


def run(
    cfg: dict,
    selected_accounts: Optional[List[str]] = None,
    test_ip: bool = False,
    headless: Optional[bool] = None,
    targets: Optional[Sequence[str]] = None,
    tabs_per_account: int = 1,
    actions: Optional[dict] = None,
    progress_callback: ProgressCallback = None,
) -> None:
    sticky, rotating = build_proxies(cfg)
    pm = ProxyManager(sticky=sticky, rotating=rotating)
    bm = BrowserManager(cfg)

    accounts = cfg.get("accounts", [])
    if not accounts:
        logger.warning("No accounts configured")
        return

    if selected_accounts is not None:
        accounts = [a for a in accounts if a.get("name") in set(selected_accounts)]
        if not accounts:
            logger.warning("No matching accounts found for selection: %s", selected_accounts)
            return

    ua_profiles = cfg.get("user_agent_profiles", [])
    if not ua_profiles:
        logger.warning("No user agent profiles configured")
        return

    ua_profile = ua_profiles[0]

    default_target = "https://api.ipify.org?format=json" if test_ip else "https://example.com/"
    if not targets:
        targets = [default_target]

    for target in targets:
        if not is_allowed_by_robots(target):
            logger.warning("robots.txt disallows accessing %s. Skipping.", target)
            return

    if actions is None:
        actions = {}

    mode = "test_ip" if test_ip and targets == [default_target] else "run"
    _emit(progress_callback, {"type": "task_start", "mode": mode, "accounts": [a.get("name") for a in accounts], "tabs": tabs_per_account})

    for account in accounts:
        account_name = account.get("name")
        if not account_name:
            logger.warning("Skipping account without name: %s", account)
            continue

        storage_path = account.get("profile")

        try:
            proxy = pm.get_sticky_for_account(account_name)
        except ValueError:
            logger.warning("No sticky proxy available for account %s; proceeding without proxy", account_name)
            proxy = None

        _emit(progress_callback, {"type": "account_start", "account": account_name, "proxy": proxy.server if proxy else None, "tabs": tabs_per_account})
        logger.info(
            "Starting session for %s using proxy %s (%s tabs)",
            account_name,
            proxy.server if proxy else "<direct>",
            tabs_per_account,
        )

        attempt = 0
        while attempt < 3:
            playwright = browser = context = None
            try:
                storage_state_obj = get_storage_state(account_name)
                playwright, browser, context = bm.launch_context_for_account(
                    proxy,
                    ua_profile,
                    storage_state_path=storage_path,
                    storage_state=storage_state_obj,
                    headless=headless,
                )

                pages = []
                for tab_index in range(max(tabs_per_account, 1)):
                    page = context.new_page()
                    current_target = targets[min(tab_index, len(targets) - 1)]
                    if test_ip and targets == [default_target]:
                        _emit(progress_callback, {"type": "tab_navigate", "account": account_name, "tab": tab_index + 1, "target": current_target, "status": "running"})
                        page.goto(current_target, timeout=60000)
                        body_text = page.evaluate("document.body.innerText")
                        logger.info("[%s][tab %s] Public IP: %s", account_name, tab_index + 1, body_text)
                        _emit(progress_callback, {"type": "tab_ip", "account": account_name, "tab": tab_index + 1, "ip": body_text})
                        _emit(progress_callback, {"type": "tab_complete", "account": account_name, "tab": tab_index + 1, "target": current_target, "status": "done"})
                    else:
                        _run_tab_sequence(page, current_target, actions, progress_callback, account_name, tab_index + 1)
                    pages.append(page)

                storage_state_json = context.storage_state()
                save_storage_state(account_name, storage_state_json)
                if storage_path:
                    Path(storage_path).parent.mkdir(parents=True, exist_ok=True)
                    context.storage_state(path=storage_path)

                logger.info("Session completed for %s", account_name)
                _emit(progress_callback, {"type": "account_complete", "account": account_name, "status": "done"})
                break
            except Exception as exc:  # noqa: BLE001
                if "ERR_PROXY_CONNECTION_FAILED" in str(exc) and proxy is not None:
                    logger.warning("Proxy connection failed for %s; retrying without proxy", account_name)
                    proxy = None
                    exponential_backoff(1)
                    _emit(progress_callback, {"type": "proxy_fallback", "account": account_name, "message": str(exc)})
                    continue
                attempt += 1
                logger.exception("Session failed for %s (attempt %s)", account_name, attempt)
                _emit(progress_callback, {"type": "account_error", "account": account_name, "attempt": attempt, "error": str(exc)})
                exponential_backoff(attempt)
            finally:
                if context:
                    context.close()
                if browser:
                    browser.close()
                if playwright:
                    playwright.stop()

    _emit(progress_callback, {"type": "task_complete", "status": "done"})


def main() -> None:
    parser = argparse.ArgumentParser(description="Proxy human-like automation")
    parser.add_argument("--config", default="config.yml", help="Path to config file")
    parser.add_argument("--test-ip", action="store_true", help="Open api.ipify.org to print the public IP seen via proxy")
    parser.add_argument("--accounts", nargs="*", help="Only run selected account names")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    parser.add_argument("--target", action="append", help="Target URL (can repeat for multiple tabs)")
    parser.add_argument("--tabs", type=int, default=1, help="Tabs per account")
    args = parser.parse_args()

    cfg = load_config(args.config)
    run(
        cfg,
        selected_accounts=args.accounts,
        test_ip=args.test_ip,
        headless=args.headless,
        targets=args.target,
        tabs_per_account=args.tabs,
    )


if __name__ == "__main__":
    main()

