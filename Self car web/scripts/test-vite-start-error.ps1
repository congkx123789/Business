# Test Vite Start to Reproduce Error
# This actually tries to start Vite and captures the error

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING VITE START (REPRODUCE ERROR)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"
Set-Location $frontendPath

Write-Host "Attempting to start Vite..." -ForegroundColor Yellow
Write-Host "This will show the actual error if it exists" -ForegroundColor Gray
Write-Host ""

# Try to start vite and capture output
$output = npm run dev 2>&1 | Select-Object -First 20

Write-Host "Vite Output:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
$output | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Check if error contains the ViteSRI message
if ($output -match "ViteSRI|vite-plugin-sri|1762396761433") {
    Write-Host "ERROR REPRODUCED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The error is still happening." -ForegroundColor Red
    Write-Host "The cached file must be in Vite's internal cache." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solution: Complete clean reinstall" -ForegroundColor Cyan
    Write-Host "  Run: .\scripts\nuclear-fix-vite-error.ps1" -ForegroundColor Gray
} else {
    Write-Host "No ViteSRI error found in output!" -ForegroundColor Green
    Write-Host "Vite may have started successfully" -ForegroundColor Green
}

Write-Host ""
Set-Location ..

