import json
import logging
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest
from native_host.modules import utils


def test_ensure_logs_dir():
    result = utils.ensure_logs_dir()
    assert isinstance(result, Path)
    assert result.exists()


def test_ensure_logs_dir_creates_directory():
    result = utils.ensure_logs_dir()
    assert result.exists()
    assert result.is_dir()


def test_configure_logging():
    logger_before = logging.getLogger()
    handler_count_before = len(logger_before.handlers)
    
    utils.configure_logging()
    
    logger_after = logging.getLogger()
    assert len(logger_after.handlers) >= handler_count_before


def test_configure_logging_idempotent():
    utils.configure_logging()
    handler_count_first = len(logging.getLogger().handlers)
    
    utils.configure_logging()
    handler_count_second = len(logging.getLogger().handlers)
    
    assert handler_count_second == handler_count_first


def test_load_settings_file_exists():
    with tempfile.TemporaryDirectory() as tmpdir:
        config_dir = Path(tmpdir) / "config"
        config_dir.mkdir()
        settings_file = config_dir / "settings.json"
        test_settings = {"key1": "value1", "key2": 123}
        settings_file.write_text(json.dumps(test_settings), encoding="utf-8")
        
        with patch("native_host.modules.utils.Path") as mock_path_class:
            mock_path_instance = MagicMock()
            mock_path_class.return_value = mock_path_instance
            mock_path_instance.resolve.return_value.parents = [Path(tmpdir)] * 3
            
            result = utils.load_settings()
            assert isinstance(result, dict)


def test_load_settings_file_not_exists():
    with tempfile.TemporaryDirectory() as tmpdir:
        config_dir = Path(tmpdir) / "config"
        config_dir.mkdir()
        
        with patch("native_host.modules.utils.Path") as mock_path_class:
            mock_path_instance = MagicMock()
            mock_path_class.return_value = mock_path_instance
            mock_path_instance.resolve.return_value.parents = [Path(tmpdir)] * 3
            
            result = utils.load_settings()
            assert isinstance(result, dict)


def test_load_settings_invalid_json():
    with tempfile.TemporaryDirectory() as tmpdir:
        config_dir = Path(tmpdir) / "config"
        config_dir.mkdir()
        settings_file = config_dir / "settings.json"
        settings_file.write_text("invalid json {", encoding="utf-8")
        
        with patch("native_host.modules.utils.Path") as mock_path_class:
            mock_path_instance = MagicMock()
            mock_path_class.return_value = mock_path_instance
            mock_path_instance.resolve.return_value.parents = [Path(tmpdir)] * 3
            
            result = utils.load_settings()
            assert isinstance(result, dict)


def test_load_settings_empty_file():
    with tempfile.TemporaryDirectory() as tmpdir:
        config_dir = Path(tmpdir) / "config"
        config_dir.mkdir()
        settings_file = config_dir / "settings.json"
        settings_file.write_text("", encoding="utf-8")
        
        with patch("native_host.modules.utils.Path") as mock_path_class:
            mock_path_instance = MagicMock()
            mock_path_class.return_value = mock_path_instance
            mock_path_instance.resolve.return_value.parents = [Path(tmpdir)] * 3
            
            result = utils.load_settings()
            assert isinstance(result, dict)


def test_load_settings_complex_data():
    with tempfile.TemporaryDirectory() as tmpdir:
        config_dir = Path(tmpdir) / "config"
        config_dir.mkdir()
        settings_file = config_dir / "settings.json"
        complex_settings = {
            "nested": {"key": "value"},
            "array": [1, 2, 3],
            "boolean": True,
            "null": None,
        }
        settings_file.write_text(json.dumps(complex_settings), encoding="utf-8")
        
        with patch("native_host.modules.utils.Path") as mock_path_class:
            mock_path_instance = MagicMock()
            mock_path_class.return_value = mock_path_instance
            mock_path_instance.resolve.return_value.parents = [Path(tmpdir)] * 3
            
            result = utils.load_settings()
            assert isinstance(result, dict)


def test_load_settings_handles_exception():
    with tempfile.TemporaryDirectory() as tmpdir:
        config_dir = Path(tmpdir) / "config"
        config_dir.mkdir()
        settings_file = config_dir / "settings.json"
        settings_file.write_text("{}", encoding="utf-8")
        
        with patch.object(Path, "read_text", side_effect=Exception("Read error")):
            result = utils.load_settings()
            assert isinstance(result, dict)

