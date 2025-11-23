# SelfCar - Check Project Status
# This script checks if backend and frontend are running

Write-Host ""
Write-Host "🔍 Checking SelfCar Project Status..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check Backend (Port 8080)
Write-Host "📦 Checking Backend (Port 8080)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/cars" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is RUNNING" -ForegroundColor Green
    Write-Host "   Status: $($backendResponse.StatusCode)" -ForegroundColor White
    Write-Host "   URL: http://localhost:8080" -ForegroundColor White
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 To start backend: .\run-backend.ps1" -ForegroundColor Yellow
}
Write-Host ""

# Check Frontend (Port 5173)
Write-Host "🎨 Checking Frontend (Port 5173)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Frontend is RUNNING" -ForegroundColor Green
    Write-Host "   Status: $($frontendResponse.StatusCode)" -ForegroundColor White
    Write-Host "   URL: http://localhost:5173" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 To start frontend: .\run-frontend.ps1" -ForegroundColor Yellow
    Write-Host "   💡 Or check if port 5173 is in use:" -ForegroundColor Yellow
    Write-Host "      netstat -ano | findstr :5173" -ForegroundColor Gray
}
Write-Host ""

# Check if ports are in use
Write-Host "🔌 Checking Port Usage..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port8080) {
    Write-Host "   Port 8080: IN USE (Process ID: $($port8080.OwningProcess))" -ForegroundColor Yellow
} else {
    Write-Host "   Port 8080: AVAILABLE" -ForegroundColor Gray
}

if ($port5173) {
    Write-Host "   Port 5173: IN USE (Process ID: $($port5173.OwningProcess))" -ForegroundColor Yellow
} else {
    Write-Host "   Port 5173: AVAILABLE" -ForegroundColor Gray
}
Write-Host ""

# Check Frontend Dependencies
Write-Host "📦 Checking Frontend Dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules NOT found" -ForegroundColor Red
    Write-Host "   💡 Run: cd frontend && npm install" -ForegroundColor Yellow
}
Write-Host ""

# Check package.json
if (Test-Path "frontend\package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ package.json NOT found" -ForegroundColor Red
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Quick Fixes:" -ForegroundColor Cyan
Write-Host "   • Start backend:  .\run-backend.ps1" -ForegroundColor White
Write-Host "   • Start frontend: .\run-frontend.ps1" -ForegroundColor White
Write-Host "   • Run without tests: .\run-without-tests.ps1" -ForegroundColor White
Write-Host ""

