Tool Facebook Auto Post – Native Messaging Base

This project scaffolds a secure-by-default base for a Chrome/Edge extension using Native Messaging to communicate with a local native host for ethical social content analysis (spam scoring). It follows the architecture and guidance in `knowledge/Native Messaging and Social Media Spam.txt`.

Structure

- `extension/`: Chrome/Edge MV3 extension
  - `manifest.json`: Declares `nativeMessaging` and background service worker
  - `background.js`: Manages persistent connection to native host
- `host/python/`: Native host implementation in Python
  - `host.py`: Implements stdio protocol, validates input, returns stub analysis
  - `requirements.txt`: Python dependencies (none required for base)
- `native-messaging/`
  - `com.my_company.social_analyzer.json`: Host manifest (Windows example)
- `scripts/win/`
  - `register_host.ps1`: Registers manifest for Chrome, Edge, Firefox in HKCU

Prerequisites

- Windows 10/11
- Python 3.9+
- Chrome or Microsoft Edge

Setup

1) Install Python host

```powershell
cd host\python
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Note path to python.exe and host.py for manifest
```

2) Configure host manifest (Windows)

Edit `native-messaging/com.my_company.social_analyzer.json` and set the `path` to the absolute path of a small launcher batch that runs Python with `host.py`, or to a frozen executable if you package it. For quick start, use a `.cmd` wrapper:

```cmd
@echo off
"C:\\Path\\to\\host\\python\\.venv\\Scripts\\python.exe" "C:\\Path\\to\\host\\python\\host.py"
```

Update the manifest `path` to point to that `.cmd`.

3) Register manifest in Windows Registry (HKCU)

```powershell
# Run from repo root with PowerShell 7+
./scripts/win/register_host.ps1 -ManifestPath (Resolve-Path native-messaging/com.my_company.social_analyzer.json) -Browsers Chrome,Edge,Firefox
```

4) Load the extension

- Chrome: More tools → Extensions → Enable Developer mode → Load unpacked → select `extension/`
- Edge: Extensions → Developer mode → Load unpacked → select `extension/`

5) Test the connection

Open the Extensions page background console for the extension and look for logs. The background service worker will connect to the native host, send a sample `analyze_text` command, and log the response.

Notes

- Keep the native host minimal (least privilege) and validate all inputs.
- For production, package the Python host as an `.exe` (e.g., PyInstaller) and update the manifest `path` accordingly.
- If you see "Specified native messaging host not found", verify registry keys and manifest path.

Security & Ethics

This base is intended for passive analysis only (no automated posting). Respect platform ToS.


