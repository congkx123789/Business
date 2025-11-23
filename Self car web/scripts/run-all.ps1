# SelfCar - Run Everything Script (WITH Tests)
# This script runs tests, backend, and frontend
# For running WITHOUT tests, use: .\run-without-tests.ps1

Write-Host "🚀 Starting SelfCar Project (WITH Tests)..." -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
$javaVersion = java --version 2>$null
$mvnVersion = mvn --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
if (-not $javaVersion) {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit 1
}
if (-not $mvnVersion) {
    Write-Host "❌ Maven not found. Please install Maven 3.8+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites OK" -ForegroundColor Green
Write-Host ""

# Run tests first
Write-Host "🧪 Running Tests..." -ForegroundColor Cyan
Write-Host ""

# Backend tests
Write-Host "📦 Running Backend Tests..." -ForegroundColor Yellow
Set-Location backend
mvn test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Backend tests passed!" -ForegroundColor Green
Write-Host ""

# Frontend tests
Write-Host "🎨 Running Frontend Tests..." -ForegroundColor Yellow
Set-Location frontend
npm run test:run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend tests passed!" -ForegroundColor Green
Write-Host ""

# Start backend
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🚀 Starting Backend on http://localhost:8080' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host '🎨 Starting Frontend on http://localhost:5173' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

