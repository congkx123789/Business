"""Data collection module for AI agent training."""
from .input_output_collector import (
    InputOutputCollector,
    TrainingDataSession,
    InputOutputSnapshot,
    KeyboardEvent,
    MouseEvent,
    ScreenState,
    SystemState,
)

__all__ = [
    "InputOutputCollector",
    "TrainingDataSession",
    "InputOutputSnapshot",
    "KeyboardEvent",
    "MouseEvent",
    "ScreenState",
    "SystemState",
]

