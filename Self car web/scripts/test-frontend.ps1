# Test Frontend Server
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FRONTEND SERVER TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendUrl = "http://localhost:5173"

Write-Host "Testing frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Frontend is RUNNING!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   URL: $frontendUrl" -ForegroundColor Gray
    Write-Host ""
    Write-Host "👉 Open your browser: $frontendUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Testing API connection..." -ForegroundColor Yellow
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Backend is also running!" -ForegroundColor Green
        Write-Host "   You can test the full application now" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Backend is not running" -ForegroundColor Yellow
        Write-Host "   Start backend server to test API connections" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Check the PowerShell window for startup errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

