import json
import sqlite3
from pathlib import Path
from typing import Optional

_DB_PATH = Path("sessions.db")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS account_sessions (
            account_name TEXT PRIMARY KEY,
            storage_state TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    return conn


def get_storage_state(account_name: str) -> Optional[dict]:
    conn = _connect()
    try:
        cur = conn.execute(
            "SELECT storage_state FROM account_sessions WHERE account_name = ?",
            (account_name,),
        )
        row = cur.fetchone()
        if not row:
            return None
        return json.loads(row[0])
    finally:
        conn.close()


def save_storage_state(account_name: str, storage_state: dict) -> None:
    payload = json.dumps(storage_state, ensure_ascii=False)
    conn = _connect()
    try:
        conn.execute(
            "INSERT INTO account_sessions(account_name, storage_state) VALUES(?, ?)\n             ON CONFLICT(account_name) DO UPDATE SET storage_state = excluded.storage_state, updated_at = CURRENT_TIMESTAMP",
            (account_name, payload),
        )
        conn.commit()
    finally:
        conn.close()
