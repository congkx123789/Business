# Final Vite Test - Verifies the fix works
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL VITE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"
Set-Location $frontendPath

Write-Host "1. Checking vite.config.js..." -ForegroundColor Yellow
$config = Get-Content "vite.config.js" -Raw
if ($config -match "ViteSRI|import.*vite-plugin-sri") {
    Write-Host "   FAIL: Config has ViteSRI" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   PASS: Config is clean" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Checking package..." -ForegroundColor Yellow
if (Test-Path "node_modules\vite-plugin-sri") {
    Write-Host "   FAIL: vite-plugin-sri still installed" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   PASS: Package removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Testing Vite start (5 second test)..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    Set-Location $using:frontendPath
    npm run dev 2>&1 | Select-Object -First 10
}

Start-Sleep -Seconds 5

$output = Receive-Job $job
Stop-Job $job
Remove-Job $job

if ($output -match "ViteSRI|vite-plugin-sri|1762396761433|does not provide an export") {
    Write-Host "   FAIL: Error still occurs" -ForegroundColor Red
    Write-Host "   Error: $output" -ForegroundColor Red
    exit 1
} elseif ($output -match "ready|Local.*5173") {
    Write-Host "   PASS: Vite started successfully!" -ForegroundColor Green
    Write-Host "   Output: $($output -join ' ')" -ForegroundColor Gray
} else {
    Write-Host "   WARN: Could not verify start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed, Vite should work!" -ForegroundColor Green
Write-Host ""

Set-Location ..

