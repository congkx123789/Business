@echo off
setlocal

REM Registers the native messaging host for the current user (HKCU)
REM Requires replacing EXTENSION_ID with your extension's ID in host-manifest.json

set HOST_NAME=com.example.automation_bridge
set MANIFEST_PATH=%~dp0native_host\host-manifest.json

REM Compute manifest directory as REG path value
set REG_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%

echo Registering %HOST_NAME% at %REG_KEY%
reg add "%REG_KEY%" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f
if errorlevel 1 (
  echo Failed to add registry key.
  exit /b 1
)

echo Done. Ensure host-manifest.json has your actual extension ID.
exit /b 0

