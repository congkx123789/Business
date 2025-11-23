# Quick Server Status Check
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SERVER STATUS CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Backend (http://localhost:8080)..." -ForegroundColor Yellow
$backendOk = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is RUNNING!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    $backendOk = $true
} catch {
    Write-Host "⏳ Backend is still starting or not accessible" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Checking Frontend (http://localhost:5173)..." -ForegroundColor Yellow
$frontendOk = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Frontend is RUNNING!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    $frontendOk = $true
} catch {
    Write-Host "⏳ Frontend is still starting or not accessible" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($backendOk -and $frontendOk) {
    Write-Host "🎉 Both servers are ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "👉 Open your browser:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:8080/api/cars" -ForegroundColor White
    Write-Host "   Health Check: http://localhost:8080/api/health" -ForegroundColor White
} else {
    Write-Host "⚠️  Servers are still starting..." -ForegroundColor Yellow
    Write-Host "   Check the PowerShell windows for startup progress" -ForegroundColor White
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

