from __future__ import annotations

from typing import List, Dict, Any
from pathlib import Path


class CapabilityPolicy:
    """Capability policy with domain allowlists and HITL keywords."""

    def __init__(self, rules: List[Dict[str, Any]] | None = None) -> None:
        self.rules = rules or [
            {"domain": "*", "allow": ["NAVIGATE", "CLICK", "TYPE", "SCROLL", "HOTKEY", "WAIT_FOR", "DRAG"], "hitl_for": ["purchase", "delete"]}
        ]

    @staticmethod
    def load(path: Path | str | None) -> "CapabilityPolicy":
        if not path:
            return CapabilityPolicy()
        p = Path(path)
        if not p.exists():
            return CapabilityPolicy()
        text = p.read_text(encoding="utf-8")
        # Try YAML if available, else naive parse for minimal shape
        try:
            import yaml  # type: ignore
            data = yaml.safe_load(text)
        except Exception:
            # naive parse: look for lines starting with allow / hitl_for
            data = {"rules": []}
            current: Dict[str, Any] = {}
            for line in text.splitlines():
                s = line.strip()
                if s.startswith("-") and "domain:" in s:
                    if current:
                        data["rules"].append(current)
                    current = {"domain": s.split("domain:", 1)[1].strip()}
                elif s.startswith("allow:"):
                    arr = s.split("[", 1)[1].split("]")[0]
                    current["allow"] = [x.strip().strip('"\'') for x in arr.split(",") if x.strip()]
                elif s.startswith("hitl_for:"):
                    arr = s.split("[", 1)[1].split("]")[0]
                    current["hitl_for"] = [x.strip().strip('"\'') for x in arr.split(",") if x.strip()]
            if current:
                data["rules"].append(current)
        rules = data.get("rules") or []
        return CapabilityPolicy(rules=rules)

    def allowed_ops_for(self, domain: str) -> List[str]:
        allowed: List[str] = []
        for r in self.rules:
            d = r.get("domain", "*")
            if d == "*" or d == domain:
                allowed.extend(r.get("allow", []))
        return list({op.upper() for op in allowed})

    def hitl_keywords(self, domain: str) -> List[str]:
        kws: List[str] = []
        for r in self.rules:
            d = r.get("domain", "*")
            if d == "*" or d == domain:
                kws.extend(r.get("hitl_for", []))
        return list({k.lower() for k in kws})

    def requires_hitl(self, text: str, domain: str) -> bool:
        text_l = (text or "").lower()
        for kw in self.hitl_keywords(domain):
            if kw in text_l:
                return True
        return False

    def is_action_allowed(self, domain: str, kind: str) -> bool:
        ops = self.allowed_ops_for(domain)
        return not ops or kind.upper() in ops


