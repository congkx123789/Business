import pytest
from unittest.mock import Mock, MagicMock
from native_host.modules.task_handler import TaskHandler
from native_host.modules.web_automator import WebAutomator
from native_host.modules.desktop_automator import DesktopAutomator


@pytest.fixture
def web_automator():
    return WebAutomator()


@pytest.fixture
def desktop_automator():
    return DesktopAutomator()


@pytest.fixture
def handler(web_automator, desktop_automator):
    return TaskHandler(web_automator, desktop_automator)


def test_task_handler_initialization(handler):
    assert handler is not None
    assert handler.web is not None
    assert handler.desktop is not None


def test_sample_task(handler):
    res = handler.handle("sample_task", {"message": "test"})
    assert res["ok"] is True
    assert res["echo"] == "test"


def test_sample_task_empty_message(handler):
    res = handler.handle("sample_task", {"message": ""})
    assert res["ok"] is True
    assert res["echo"] == ""


def test_sample_task_no_message(handler):
    res = handler.handle("sample_task", {})
    assert res["ok"] is True
    assert res["echo"] == ""


def test_open_url_valid(handler):
    res = handler.handle("open_url", {"url": "https://example.com"})
    assert res["ok"] is True


def test_open_url_invalid_missing(handler):
    res = handler.handle("open_url", {})
    assert res["ok"] is False
    assert "error" in res


def test_open_url_invalid_empty(handler):
    res = handler.handle("open_url", {"url": ""})
    assert res["ok"] is False


def test_open_url_invalid_type(handler):
    res = handler.handle("open_url", {"url": 123})
    assert res["ok"] is False


def test_upload_file_valid(handler):
    res = handler.handle("upload_file", {"path": "C:/test/file.txt"})
    assert isinstance(res, dict)
    assert "ok" in res


def test_upload_file_invalid_missing(handler):
    res = handler.handle("upload_file", {})
    assert res["ok"] is False
    assert "error" in res


def test_upload_file_invalid_empty(handler):
    res = handler.handle("upload_file", {"path": ""})
    assert res["ok"] is False


def test_upload_file_invalid_type(handler):
    res = handler.handle("upload_file", {"path": 123})
    assert res["ok"] is False


def test_app_launch_valid(handler):
    res = handler.handle("app_launch", {"exe_path": "C:/test/app.exe"})
    assert isinstance(res, dict)


def test_app_launch_with_args_string(handler):
    res = handler.handle("app_launch", {"exe_path": "C:/test/app.exe", "args": "arg1"})
    assert isinstance(res, dict)


def test_app_launch_with_args_int(handler):
    res = handler.handle("app_launch", {"exe_path": "C:/test/app.exe", "args": 123})
    assert isinstance(res, dict)


def test_app_launch_with_args_float(handler):
    res = handler.handle("app_launch", {"exe_path": "C:/test/app.exe", "args": 1.5})
    assert isinstance(res, dict)


def test_app_launch_invalid_missing(handler):
    res = handler.handle("app_launch", {})
    assert res["ok"] is False


def test_app_launch_invalid_empty(handler):
    res = handler.handle("app_launch", {"exe_path": ""})
    assert res["ok"] is False


def test_app_launch_invalid_args_type(handler):
    res = handler.handle("app_launch", {"exe_path": "C:/test/app.exe", "args": []})
    assert res["ok"] is False


def test_app_focus_valid(handler):
    res = handler.handle("app_focus", {"title": "Test Window"})
    assert isinstance(res, dict)


def test_app_focus_invalid_missing(handler):
    res = handler.handle("app_focus", {})
    assert res["ok"] is False


def test_app_focus_invalid_empty(handler):
    res = handler.handle("app_focus", {"title": ""})
    assert res["ok"] is False


def test_app_send_keys_valid(handler):
    res = handler.handle("app_send_keys", {"keys": "Hello"})
    assert isinstance(res, dict)


def test_app_send_keys_invalid_missing(handler):
    res = handler.handle("app_send_keys", {})
    assert res["ok"] is False


def test_app_send_keys_invalid_empty(handler):
    res = handler.handle("app_send_keys", {"keys": ""})
    assert res["ok"] is False


def test_app_click_valid(handler):
    res = handler.handle("app_click", {"x": 100, "y": 200})
    assert isinstance(res, dict)


def test_app_click_with_button(handler):
    res = handler.handle("app_click", {"x": 100, "y": 200, "button": "right"})
    assert isinstance(res, dict)


def test_app_click_invalid_missing_x(handler):
    res = handler.handle("app_click", {"y": 200})
    assert res["ok"] is False


def test_app_click_invalid_missing_y(handler):
    res = handler.handle("app_click", {"x": 100})
    assert res["ok"] is False


def test_app_click_invalid_type_x(handler):
    res = handler.handle("app_click", {"x": "100", "y": 200})
    assert res["ok"] is False


def test_app_click_invalid_type_y(handler):
    res = handler.handle("app_click", {"x": 100, "y": "200"})
    assert res["ok"] is False


def test_cursor_get_pos(handler):
    res = handler.handle("cursor_get_pos", {})
    assert isinstance(res, dict)
    assert "ok" in res


def test_cursor_move_valid(handler):
    res = handler.handle("cursor_move", {"x": 500, "y": 600})
    assert isinstance(res, dict)


def test_cursor_move_invalid_missing(handler):
    res = handler.handle("cursor_move", {})
    assert res["ok"] is False


def test_cursor_move_invalid_type(handler):
    res = handler.handle("cursor_move", {"x": "500", "y": 600})
    assert res["ok"] is False


def test_cursor_drag_valid(handler):
    res = handler.handle("cursor_drag", {"from_x": 10, "from_y": 20, "to_x": 100, "to_y": 200})
    assert isinstance(res, dict)


def test_cursor_drag_with_button(handler):
    res = handler.handle(
        "cursor_drag",
        {"from_x": 10, "from_y": 20, "to_x": 100, "to_y": 200, "button": "right"},
    )
    assert isinstance(res, dict)


def test_cursor_drag_invalid_missing(handler):
    res = handler.handle("cursor_drag", {"from_x": 10, "from_y": 20})
    assert res["ok"] is False


def test_cursor_drag_invalid_type(handler):
    res = handler.handle("cursor_drag", {"from_x": "10", "from_y": 20, "to_x": 100, "to_y": 200})
    assert res["ok"] is False


def test_cursor_scroll_valid(handler):
    res = handler.handle("cursor_scroll", {"wheel_delta": 120})
    assert isinstance(res, dict)


def test_cursor_scroll_with_coords(handler):
    res = handler.handle("cursor_scroll", {"wheel_delta": 120, "x": 500, "y": 600})
    assert isinstance(res, dict)


def test_cursor_scroll_invalid_missing(handler):
    res = handler.handle("cursor_scroll", {})
    assert res["ok"] is False


def test_cursor_scroll_invalid_type(handler):
    res = handler.handle("cursor_scroll", {"wheel_delta": "120"})
    assert res["ok"] is False


def test_cursor_scroll_invalid_coord_type(handler):
    res = handler.handle("cursor_scroll", {"wheel_delta": 120, "x": "500"})
    assert res["ok"] is False


def test_agent_cursor_context(handler):
    res = handler.handle("agent_cursor_context", {})
    assert isinstance(res, dict)
    assert "ok" in res


def test_agent_cursor_screenshot_default(handler):
    res = handler.handle("agent_cursor_screenshot", {})
    assert isinstance(res, dict)


def test_agent_cursor_screenshot_custom(handler):
    res = handler.handle("agent_cursor_screenshot", {"width": 800, "height": 600})
    assert isinstance(res, dict)


def test_agent_cursor_screenshot_invalid_width(handler):
    res = handler.handle("agent_cursor_screenshot", {"width": "800", "height": 600})
    assert res["ok"] is False


def test_agent_cursor_screenshot_invalid_height(handler):
    res = handler.handle("agent_cursor_screenshot", {"width": 800, "height": "600"})
    assert res["ok"] is False


def test_unknown_action(handler):
    res = handler.handle("unknown_action", {})
    assert res["ok"] is False
    assert "error" in res
    assert "Unknown action" in res["error"]


def test_empty_action(handler):
    res = handler.handle("", {})
    assert res["ok"] is False


def test_all_actions_return_dict(handler):
    actions = [
        ("sample_task", {"message": "test"}),
        ("open_url", {"url": "https://test.com"}),
        ("upload_file", {"path": "test.txt"}),
        ("app_launch", {"exe_path": "test.exe"}),
        ("app_focus", {"title": "test"}),
        ("app_send_keys", {"keys": "test"}),
        ("app_click", {"x": 0, "y": 0}),
        ("cursor_get_pos", {}),
        ("cursor_move", {"x": 0, "y": 0}),
        ("cursor_drag", {"from_x": 0, "from_y": 0, "to_x": 10, "to_y": 10}),
        ("cursor_scroll", {"wheel_delta": 10}),
        ("agent_cursor_context", {}),
        ("agent_cursor_screenshot", {}),
    ]
    for action, data in actions:
        res = handler.handle(action, data)
        assert isinstance(res, dict), f"Action {action} did not return dict"
        assert "ok" in res, f"Action {action} result missing 'ok' key"

