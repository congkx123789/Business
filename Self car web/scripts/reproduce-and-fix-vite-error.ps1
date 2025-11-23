# Reproduce and Fix Vite Error Test
# This script finds and fixes the exact cached file causing the error

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REPRODUCE & FIX VITE ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"
$errorPattern = "1762396761433-bb3255d25bdca"
$foundFiles = @()

Set-Location $frontendPath

Write-Host "Step 1: Searching for the cached file everywhere..." -ForegroundColor Yellow
Write-Host "   Looking for: *$errorPattern*" -ForegroundColor Gray
Write-Host ""

# Search in frontend directory
$foundFiles += Get-ChildItem -Path "." -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -like "*$errorPattern*" -or $_.FullName -like "*$errorPattern*"
}

# Search in node_modules more thoroughly
$foundFiles += Get-ChildItem -Path "node_modules" -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -like "*$errorPattern*" -or $_.FullName -like "*$errorPattern*"
}

# Search for any vite.config.js timestamp files
$foundFiles += Get-ChildItem -Path "." -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -like "vite.config.js.timestamp-*" -or $_.Name -like "*vite.config*timestamp*"
}

# Search in Windows Temp
$tempPath = $env:TEMP
if (Test-Path $tempPath) {
    Write-Host "   Searching in Windows Temp: $tempPath" -ForegroundColor Gray
    $foundFiles += Get-ChildItem -Path $tempPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -like "*$errorPattern*" -or $_.FullName -like "*vite.config*timestamp*"
    }
}

# Search in AppData
$appDataPath = "$env:APPDATA\npm-cache"
if (Test-Path $appDataPath) {
    Write-Host "   Searching in AppData npm-cache: $appDataPath" -ForegroundColor Gray
    $foundFiles += Get-ChildItem -Path $appDataPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -like "*$errorPattern*" -or $_.FullName -like "*vite.config*timestamp*"
    }
}

# Search in LocalAppData
$localAppDataPath = "$env:LOCALAPPDATA"
if (Test-Path $localAppDataPath) {
    Write-Host "   Searching in LocalAppData..." -ForegroundColor Gray
    $viteCachePaths = @(
        "$localAppDataPath\.vite",
        "$localAppDataPath\vite",
        "$localAppDataPath\npm-cache"
    )
    foreach ($vitePath in $viteCachePaths) {
        if (Test-Path $vitePath) {
            $foundFiles += Get-ChildItem -Path $vitePath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
                $_.Name -like "*$errorPattern*" -or $_.FullName -like "*vite.config*timestamp*"
            }
        }
    }
}

Write-Host ""
if ($foundFiles.Count -gt 0) {
    Write-Host "FOUND $($foundFiles.Count) cached file(s):" -ForegroundColor Red
    foreach ($file in $foundFiles) {
        Write-Host "  - $($file.FullName)" -ForegroundColor Red
        Write-Host "    Deleting..." -ForegroundColor Yellow
        try {
            Remove-Item $file.FullName -Force -ErrorAction Stop
            Write-Host "    DELETED" -ForegroundColor Green
        } catch {
            Write-Host "    ERROR: Could not delete - $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "    Try: Close all Node processes and try again" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No cached files found with that pattern" -ForegroundColor Yellow
    Write-Host "The file might be locked by a running process" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Clearing all Vite caches..." -ForegroundColor Yellow

# Remove all .vite directories
$viteDirs = @(
    ".vite",
    "node_modules\.vite"
)

foreach ($dir in $viteDirs) {
    if (Test-Path $dir) {
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "  Removed: $dir" -ForegroundColor Green
        } catch {
            Write-Host "  Could not remove: $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Step 3: Verifying vite.config.js..." -ForegroundColor Yellow
if (Test-Path "vite.config.js") {
    $config = Get-Content "vite.config.js" -Raw
    if ($config -match "import.*ViteSRI|ViteSRI\(") {
        Write-Host "  FAIL: Config still has ViteSRI" -ForegroundColor Red
        Write-Host "  This needs to be fixed!" -ForegroundColor Red
    } else {
        Write-Host "  PASS: Config is clean" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 4: Checking if vite-plugin-sri is installed..." -ForegroundColor Yellow
if (Test-Path "node_modules\vite-plugin-sri") {
    Write-Host "  FAIL: vite-plugin-sri is still installed" -ForegroundColor Red
    Write-Host "  Removing..." -ForegroundColor Yellow
    npm uninstall vite-plugin-sri --legacy-peer-deps 2>&1 | Out-Null
    Write-Host "  Removed" -ForegroundColor Green
} else {
    Write-Host "  PASS: vite-plugin-sri not installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 5: Testing if Vite can load config..." -ForegroundColor Yellow
Write-Host "  Attempting to validate config..." -ForegroundColor Gray

# Try to check if vite can read the config without errors
$testResult = npm run dev -- --help 2>&1 | Select-String -Pattern "error|Error|ViteSRI" 
if ($testResult) {
    Write-Host "  WARNING: Still seeing errors" -ForegroundColor Yellow
    Write-Host "  $testResult" -ForegroundColor Gray
} else {
    Write-Host "  PASS: No obvious errors in config" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($foundFiles.Count -gt 0) {
    Write-Host "✅ Found and deleted $($foundFiles.Count) cached file(s)" -ForegroundColor Green
} else {
    Write-Host "⚠️  No cached files found - may need to:" -ForegroundColor Yellow
    Write-Host "   1. Stop all Node.js processes" -ForegroundColor White
    Write-Host "   2. Close all PowerShell windows" -ForegroundColor White
    Write-Host "   3. Run this script again" -ForegroundColor White
    Write-Host "   4. Or restart your computer" -ForegroundColor White
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Stop any running frontend server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Close all PowerShell windows with npm/node processes" -ForegroundColor White
Write-Host "3. Start fresh: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "If error persists:" -ForegroundColor Yellow
Write-Host "  Run: .\scripts\nuclear-fix-vite-error.ps1" -ForegroundColor Cyan
Write-Host ""

Set-Location ..

