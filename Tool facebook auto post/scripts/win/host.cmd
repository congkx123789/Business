@echo off
setlocal

REM Resolve repo root relative to this script
set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\..\

set VENV_PY=%REPO_ROOT%host\python\.venv\Scripts\python.exe
if exist "%VENV_PY%" (
  "%VENV_PY%" "%REPO_ROOT%host\python\host.py"
) else (
  python "%REPO_ROOT%host\python\host.py"
)


