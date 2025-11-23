import pytest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
from native_host.modules.desktop_automator import DesktopAutomator


def test_upload_file_stub():
    da = DesktopAutomator()
    res = da.upload_file("C:/path/to/file.txt")
    assert isinstance(res, dict)
    assert "ok" in res


def test_desktop_capability_interfaces_exist():
    da = DesktopAutomator()
    assert hasattr(da, "launch_app")
    assert hasattr(da, "focus_window")
    assert hasattr(da, "send_keys")
    assert hasattr(da, "click")
    assert hasattr(da, "get_cursor_pos")
    assert hasattr(da, "move_cursor")
    assert hasattr(da, "drag")
    assert hasattr(da, "scroll")


def test_cursor_methods_return_dicts():
    da = DesktopAutomator()
    res1 = da.get_cursor_pos()
    assert isinstance(res1, dict)
    res2 = da.move_cursor(0, 0)
    assert isinstance(res2, dict)


def test_agent_cursor_interfaces():
    da = DesktopAutomator()
    assert hasattr(da, "get_cursor_context")
    assert hasattr(da, "screenshot_at_cursor")


def test_ensure_libs():
    da = DesktopAutomator()
    result = da.ensure_libs()
    assert result is None or isinstance(result, str)


def test_launch_app_invalid_path():
    da = DesktopAutomator()
    res = da.launch_app("nonexistent/path/to/app.exe")
    assert res["ok"] is False
    assert "error" in res


def test_launch_app_with_args():
    da = DesktopAutomator()
    with patch("native_host.modules.desktop_automator.Application") as mock_app:
        mock_app_instance = MagicMock()
        mock_app.return_value.start.return_value = mock_app_instance
        res = da.launch_app("C:/test/app.exe", "arg1 arg2")
        assert isinstance(res, dict)


def test_launch_app_with_none_args():
    da = DesktopAutomator()
    with patch("native_host.modules.desktop_automator.Application") as mock_app:
        mock_app_instance = MagicMock()
        mock_app.return_value.start.return_value = mock_app_instance
        res = da.launch_app("C:/test/app.exe", None)
        assert isinstance(res, dict)


def test_focus_window():
    da = DesktopAutomator()
    res = da.focus_window("Test Window")
    assert isinstance(res, dict)
    assert "ok" in res


def test_send_keys():
    da = DesktopAutomator()
    res = da.send_keys("Hello World")
    assert isinstance(res, dict)
    assert "ok" in res


def test_click_valid_button():
    da = DesktopAutomator()
    for button in ["left", "right", "middle"]:
        res = da.click(100, 200, button)
        assert isinstance(res, dict)
        assert "ok" in res


def test_click_invalid_button():
    da = DesktopAutomator()
    res = da.click(100, 200, "invalid")
    assert res["ok"] is False
    assert "error" in res


def test_click_negative_coordinates():
    da = DesktopAutomator()
    res = da.click(-10, -20, "left")
    assert isinstance(res, dict)


def test_get_cursor_pos():
    da = DesktopAutomator()
    res = da.get_cursor_pos()
    assert isinstance(res, dict)
    assert "ok" in res
    if res["ok"]:
        assert "x" in res
        assert "y" in res
        assert isinstance(res["x"], int)
        assert isinstance(res["y"], int)


def test_move_cursor():
    da = DesktopAutomator()
    res = da.move_cursor(500, 600)
    assert isinstance(res, dict)
    assert "ok" in res


def test_move_cursor_zero():
    da = DesktopAutomator()
    res = da.move_cursor(0, 0)
    assert isinstance(res, dict)


def test_move_cursor_large_values():
    da = DesktopAutomator()
    res = da.move_cursor(99999, 99999)
    assert isinstance(res, dict)


def test_drag_valid():
    da = DesktopAutomator()
    res = da.drag(10, 20, 100, 200, "left")
    assert isinstance(res, dict)
    assert "ok" in res


def test_drag_invalid_button():
    da = DesktopAutomator()
    res = da.drag(10, 20, 100, 200, "invalid")
    assert res["ok"] is False
    assert "error" in res


def test_drag_all_buttons():
    da = DesktopAutomator()
    for button in ["left", "right", "middle"]:
        res = da.drag(10, 20, 100, 200, button)
        assert isinstance(res, dict)


def test_scroll_positive():
    da = DesktopAutomator()
    res = da.scroll(120)
    assert isinstance(res, dict)
    assert "ok" in res


def test_scroll_negative():
    da = DesktopAutomator()
    res = da.scroll(-120)
    assert isinstance(res, dict)


def test_scroll_with_coords():
    da = DesktopAutomator()
    res = da.scroll(120, 500, 600)
    assert isinstance(res, dict)


def test_scroll_with_none_coords():
    da = DesktopAutomator()
    res = da.scroll(120, None, None)
    assert isinstance(res, dict)


def test_scroll_zero():
    da = DesktopAutomator()
    res = da.scroll(0)
    assert isinstance(res, dict)


def test_get_cursor_context():
    da = DesktopAutomator()
    res = da.get_cursor_context()
    assert isinstance(res, dict)
    assert "ok" in res
    if res["ok"]:
        assert "x" in res
        assert "y" in res


def test_screenshot_at_cursor_default_size():
    da = DesktopAutomator()
    res = da.screenshot_at_cursor()
    assert isinstance(res, dict)
    assert "ok" in res


def test_screenshot_at_cursor_custom_size():
    da = DesktopAutomator()
    res = da.screenshot_at_cursor(800, 600)
    assert isinstance(res, dict)


def test_screenshot_at_cursor_small_size():
    da = DesktopAutomator()
    res = da.screenshot_at_cursor(100, 100)
    assert isinstance(res, dict)


def test_screenshot_at_cursor_large_size():
    da = DesktopAutomator()
    res = da.screenshot_at_cursor(2000, 2000)
    assert isinstance(res, dict)


def test_upload_file_nonexistent():
    da = DesktopAutomator()
    res = da.upload_file("C:/nonexistent/file.txt")
    assert isinstance(res, dict)
    assert "ok" in res


def test_upload_file_empty_path():
    da = DesktopAutomator()
    res = da.upload_file("")
    assert isinstance(res, dict)


def test_upload_file_relative_path():
    da = DesktopAutomator()
    res = da.upload_file("./test.txt")
    assert isinstance(res, dict)


def test_all_methods_return_dict():
    da = DesktopAutomator()
    methods = [
        lambda: da.launch_app("test.exe"),
        lambda: da.focus_window("test"),
        lambda: da.send_keys("test"),
        lambda: da.click(0, 0),
        lambda: da.get_cursor_pos(),
        lambda: da.move_cursor(0, 0),
        lambda: da.drag(0, 0, 10, 10),
        lambda: da.scroll(10),
        lambda: da.get_cursor_context(),
        lambda: da.screenshot_at_cursor(),
        lambda: da.upload_file("test.txt"),
    ]
    for method in methods:
        res = method()
        assert isinstance(res, dict), f"Method {method} did not return dict"
        assert "ok" in res, f"Method {method} result missing 'ok' key"

