# Nuclear Fix for Vite Config Error
# This script does a complete clean reinstall if the error persists

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NUCLEAR FIX FOR VITE ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will completely clean and reinstall frontend dependencies" -ForegroundColor Yellow
Write-Host ""

$frontendPath = "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

Write-Host "Step 1: Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed node_modules" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Removing all cache files and directories..." -ForegroundColor Yellow
Remove-Item -Path ".vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Filter "*timestamp-*.mjs" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "  All caches removed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed package-lock.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Verifying vite.config.js is clean..." -ForegroundColor Yellow
$config = Get-Content "vite.config.js" -Raw -ErrorAction SilentlyContinue
if ($config -match "ViteSRI") {
    Write-Host "  WARNING: Config still has ViteSRI - needs manual fix" -ForegroundColor Red
} else {
    Write-Host "  Config is clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 5: Reinstalling dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Installation had issues" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CLEAN INSTALL COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now try starting the server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "If the error still persists, the cached file might be in:" -ForegroundColor Yellow
Write-Host "  - Windows Temp folder: %TEMP%" -ForegroundColor Gray
Write-Host "  - User AppData: %APPDATA%\npm-cache" -ForegroundColor Gray
Write-Host ""
Write-Host "Solution: Clear those or restart your computer" -ForegroundColor Gray
Write-Host ""

Set-Location ..

