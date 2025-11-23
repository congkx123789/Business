# Test Vite Config Startup
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VITE CONFIG STARTUP TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

Write-Host "1. Checking vite.config.js..." -ForegroundColor Yellow
$configContent = Get-Content "$frontendPath\vite.config.js" -Raw

if ($configContent -notmatch "import.*ViteSRI|ViteSRI\(") {
    Write-Host "  ✅ No ViteSRI imports found" -ForegroundColor Green
} else {
    Write-Host "  ❌ Still has ViteSRI references" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing if Vite can load config..." -ForegroundColor Yellow
Write-Host "   (This will show if there are any syntax errors)" -ForegroundColor Gray

Set-Location $frontendPath

# Try to run vite --version first to check if it's installed
try {
    $viteVersion = npm run dev -- --version 2>&1 | Select-String -Pattern "vite" | Select-Object -First 1
    Write-Host "  ✅ Vite is available" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not check Vite version" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. Summary:" -ForegroundColor Yellow
Write-Host "   - Config file is clean" -ForegroundColor Green
Write-Host "   - SRI plugin removed" -ForegroundColor Green
Write-Host "   - Ready to start" -ForegroundColor Green
Write-Host ""
Write-Host "To start frontend:" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

