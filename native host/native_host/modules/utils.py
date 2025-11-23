import json
import logging
import logging.handlers
import os
from pathlib import Path
from typing import Any, Dict


def ensure_logs_dir() -> Path:
    logs_dir = Path(__file__).resolve().parents[2] / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    return logs_dir


def configure_logging() -> None:
    logs_dir = ensure_logs_dir()
    log_path = logs_dir / "app.log"

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    if not any(isinstance(h, logging.handlers.RotatingFileHandler) for h in logger.handlers):
        file_handler = logging.handlers.RotatingFileHandler(
            log_path, maxBytes=1_000_000, backupCount=3, encoding="utf-8"
        )
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    if not any(isinstance(h, logging.StreamHandler) for h in logger.handlers):
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        logger.addHandler(console)


def load_settings() -> Dict[str, Any]:
    base_dir = Path(__file__).resolve().parents[2]
    settings_path = base_dir / "config" / "settings.json"
    if settings_path.exists():
        try:
            return json.loads(settings_path.read_text(encoding="utf-8"))
        except Exception:  # intentional: settings should not crash app
            logging.getLogger(__name__).exception("Failed to read settings.json")
    return {}

