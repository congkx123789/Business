from typing import Literal, Optional, TypedDict, List, Dict, Any


ActionKind = Literal[
    "NAVIGATE",
    "WAIT_FOR",
    "CLICK",
    "TYPE",
    "SELECT",
    "SCROLL",
    "HOTKEY",
    "DRAG",
    "ASSERT",
]


class ActionTarget(TypedDict, total=False):
    selector: str
    role: str
    name: str
    bbox: List[float]  # [x,y,w,h]
    tab: int


class Action(TypedDict, total=False):
    action_id: str
    kind: ActionKind
    target: ActionTarget
    input_text: str
    assert_: Dict[str, Any]
    meta: Dict[str, Any]


