# Test Vite Error Fix
# Verifies that the ViteSRI error is resolved

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VITE ERROR FIX VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"
$allGood = $true

Write-Host "1. Checking vite-plugin-sri package..." -ForegroundColor Yellow
if (Test-Path "$frontendPath\node_modules\vite-plugin-sri") {
    Write-Host "   FAIL: vite-plugin-sri is still installed" -ForegroundColor Red
    Write-Host "   Fix: npm uninstall vite-plugin-sri --legacy-peer-deps" -ForegroundColor Gray
    $allGood = $false
} else {
    Write-Host "   PASS: vite-plugin-sri package removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Checking vite.config.js..." -ForegroundColor Yellow
if (Test-Path "$frontendPath\vite.config.js") {
    $config = Get-Content "$frontendPath\vite.config.js" -Raw
    if ($config -match "import.*ViteSRI|ViteSRI\(") {
        Write-Host "   FAIL: Config still has ViteSRI references" -ForegroundColor Red
        $allGood = $false
    } else {
        Write-Host "   PASS: Config is clean" -ForegroundColor Green
    }
} else {
    Write-Host "   FAIL: vite.config.js not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "3. Checking for cached files..." -ForegroundColor Yellow
$cacheFiles = Get-ChildItem -Path $frontendPath -Filter "*timestamp-*.mjs" -Recurse -ErrorAction SilentlyContinue
if ($cacheFiles.Count -gt 0) {
    Write-Host "   FAIL: Found $($cacheFiles.Count) cached file(s)" -ForegroundColor Red
    foreach ($file in $cacheFiles) {
        Write-Host "     - $($file.Name)" -ForegroundColor Gray
    }
    Write-Host "   Fix: Remove these files manually" -ForegroundColor Gray
    $allGood = $false
} else {
    Write-Host "   PASS: No cached files found" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Checking Vite cache directories..." -ForegroundColor Yellow
$cacheDirs = @("$frontendPath\.vite", "$frontendPath\node_modules\.vite")
$foundCache = $false
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "   WARN: Found: $dir" -ForegroundColor Yellow
        $foundCache = $true
    }
}
if (-not $foundCache) {
    Write-Host "   PASS: No cache directories found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "SUCCESS: All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The ViteSRI error should be resolved." -ForegroundColor Green
    Write-Host "Try starting the frontend server:" -ForegroundColor Cyan
    Write-Host "  cd frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
} else {
    Write-Host "ISSUES FOUND: Some problems need to be fixed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run this script to fix:" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor Gray
    Write-Host "  npm uninstall vite-plugin-sri --legacy-peer-deps" -ForegroundColor Gray
    Write-Host "  Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue" -ForegroundColor Gray
    Write-Host "  Get-ChildItem -Filter '*timestamp-*.mjs' -Recurse | Remove-Item -Force" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

