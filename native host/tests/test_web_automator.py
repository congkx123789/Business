import pytest
from native_host.modules.web_automator import WebAutomator


def test_open_url_stub():
    wa = WebAutomator()
    res = wa.open_url("https://example.com")
    assert res["ok"] is True
    assert "note" in res


def test_open_url_http():
    wa = WebAutomator()
    res = wa.open_url("http://example.com")
    assert res["ok"] is True


def test_open_url_with_path():
    wa = WebAutomator()
    res = wa.open_url("https://example.com/path/to/page")
    assert res["ok"] is True


def test_open_url_with_query():
    wa = WebAutomator()
    res = wa.open_url("https://example.com?param=value")
    assert res["ok"] is True


def test_open_url_localhost():
    wa = WebAutomator()
    res = wa.open_url("http://localhost:8080")
    assert res["ok"] is True


def test_open_url_empty():
    wa = WebAutomator()
    res = wa.open_url("")
    assert res["ok"] is True


def test_open_url_invalid_format():
    wa = WebAutomator()
    res = wa.open_url("not-a-url")
    assert res["ok"] is True


def test_web_automator_initialization():
    wa = WebAutomator()
    assert wa is not None
    assert hasattr(wa, "open_url")


def test_open_url_returns_dict():
    wa = WebAutomator()
    res = wa.open_url("https://test.com")
    assert isinstance(res, dict)
    assert "ok" in res


def test_open_url_multiple_calls():
    wa = WebAutomator()
    urls = [
        "https://example.com",
        "https://google.com",
        "https://github.com",
    ]
    for url in urls:
        res = wa.open_url(url)
        assert res["ok"] is True

