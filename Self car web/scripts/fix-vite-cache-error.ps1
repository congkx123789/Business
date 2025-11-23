# Fix Vite Cache Error Script
# This script removes all cached Vite config files that cause the ViteSRI error

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VITE CACHE ERROR FIXER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

Write-Host "1. Searching for cached Vite config files..." -ForegroundColor Yellow
$cacheFiles = @()

# Search for timestamp files
$cacheFiles += Get-ChildItem -Path "." -Filter "*.timestamp-*.mjs" -Recurse -ErrorAction SilentlyContinue
$cacheFiles += Get-ChildItem -Path "node_modules" -Filter "*.timestamp-*.mjs" -Recurse -ErrorAction SilentlyContinue

if ($cacheFiles.Count -gt 0) {
    Write-Host "   Found $($cacheFiles.Count) cached file(s):" -ForegroundColor Yellow
    foreach ($file in $cacheFiles) {
        Write-Host "   - $($file.Name)" -ForegroundColor Gray
        Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "     ✅ Deleted" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ No cached config files found" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Clearing Vite cache directories..." -ForegroundColor Yellow

$cacheDirs = @(".vite", "node_modules\.vite")
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Cleared: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Not found: $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "3. Checking vite.config.js..." -ForegroundColor Yellow
$configContent = Get-Content "vite.config.js" -Raw -ErrorAction SilentlyContinue

if ($configContent) {
    if ($configContent -match "import.*ViteSRI|ViteSRI\(") {
        Write-Host "   ❌ Config still has ViteSRI references!" -ForegroundColor Red
        Write-Host "   ⚠️  Need to remove ViteSRI from vite.config.js" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Config is clean (no ViteSRI references)" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Could not read vite.config.js" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Checking if vite-plugin-sri is installed..." -ForegroundColor Yellow
if (Test-Path "node_modules\vite-plugin-sri") {
    Write-Host "   ⚠️  vite-plugin-sri package is still installed" -ForegroundColor Yellow
    Write-Host "   💡 Consider uninstalling: npm uninstall vite-plugin-sri" -ForegroundColor Gray
} else {
    Write-Host "   ✅ vite-plugin-sri package not found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Cache files cleared" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart frontend server: npm run dev" -ForegroundColor White
Write-Host "2. If error persists, uninstall vite-plugin-sri:" -ForegroundColor White
Write-Host "   npm uninstall vite-plugin-sri --legacy-peer-deps" -ForegroundColor Gray
Write-Host "3. Clear caches again and restart" -ForegroundColor White
Write-Host ""

Set-Location ..

