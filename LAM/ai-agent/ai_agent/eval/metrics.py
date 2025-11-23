from dataclasses import dataclass


@dataclass
class RunMetrics:
    success: bool = True
    steps: int = 1
    duration_ms: int = 0


