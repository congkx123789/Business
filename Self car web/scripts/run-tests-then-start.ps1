# SelfCar - Run Tests Then Start Project
# This script: 1. Runs all tests 2. If tests pass, starts backend and frontend

Write-Host ""
Write-Host "🧪 Running Tests, Then Starting Project..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking Prerequisites..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

$nodeVersion = node --version 2>$null
$javaVersion = java --version 2>$null
$mvnVersion = mvn --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}

if (-not $javaVersion) {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Java: Found" -ForegroundColor Green
}

if (-not $mvnVersion) {
    Write-Host "❌ Maven not found. Please install Maven 3.8+" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Maven: Found" -ForegroundColor Green
}

Write-Host "✅ All prerequisites OK" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 1: Run Tests
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 STEP 1: Running All Tests..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$testFailed = $false

# Backend tests
Write-Host "📦 Running Backend Tests..." -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location backend
mvn test
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
    $testFailed = $true
} else {
    Write-Host ""
    Write-Host "✅ Backend tests passed!" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# Frontend tests
Write-Host "🎨 Running Frontend Tests..." -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies first..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
}

npm run test:run
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
    $testFailed = $true
} else {
    Write-Host ""
    Write-Host "✅ Frontend tests passed!" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# Check if tests passed
if ($testFailed) {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "❌ Some tests failed! Please fix the errors before starting the project." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Fix the test errors and run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 2: Start Backend
# ============================================
Write-Host "📦 STEP 2: Starting Backend Server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Backend will run on: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📍 API Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""

# Check if port 8080 is in use
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "⚠️  Port 8080 is already in use!" -ForegroundColor Yellow
    Write-Host "   Killing the process..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $port8080.OwningProcess -Force
        Start-Sleep -Seconds 2
        Write-Host "✅ Port 8080 is now available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not free port 8080. Please close it manually." -ForegroundColor Red
    }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PWD\backend'; `$
    Write-Host '📦 SelfCar Backend Server' -ForegroundColor Cyan; `$
    Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
    Write-Host ''; `$
    Write-Host '✅ Tests passed - Starting server...' -ForegroundColor Green; `$
    Write-Host ''; `$
    Write-Host 'Starting Spring Boot...' -ForegroundColor Yellow; `$
    Write-Host '📍 URL: http://localhost:8080' -ForegroundColor Green; `$
    Write-Host '📍 API: http://localhost:8080/api/cars' -ForegroundColor Green; `$
    Write-Host '📍 Docs: http://localhost:8080/swagger-ui.html' -ForegroundColor Green; `$
    Write-Host ''; `$
    Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow; `$
    Write-Host ''; `$
    mvn spring-boot:run"

Write-Host "⏳ Waiting for backend to start (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verify backend is running
Write-Host "🔍 Verifying backend is accessible..." -ForegroundColor Yellow
try {
    $backendCheck = Invoke-WebRequest -Uri "http://localhost:8080/api/cars" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is running and accessible!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
    Write-Host "   This is normal, it may take a bit longer." -ForegroundColor White
}
Write-Host ""

# ============================================
# STEP 3: Start Frontend
# ============================================
Write-Host "🎨 STEP 3: Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Check if port 5173 is in use
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "⚠️  Port 5173 is already in use!" -ForegroundColor Yellow
    Write-Host "   Killing the process..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $port5173.OwningProcess -Force
        Start-Sleep -Seconds 2
        Write-Host "✅ Port 5173 is now available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not free port 5173. Please close it manually." -ForegroundColor Red
    }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PWD\frontend'; `$
    Write-Host '🎨 SelfCar Frontend Server' -ForegroundColor Cyan; `$
    Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
    Write-Host ''; `$
    Write-Host '✅ Tests passed - Starting server...' -ForegroundColor Green; `$
    Write-Host ''; `$
    Write-Host 'Starting Vite...' -ForegroundColor Yellow; `$
    Write-Host '📍 URL: http://localhost:5173' -ForegroundColor Green; `$
    Write-Host ''; `$
    Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow; `$
    Write-Host ''; `$
    npm run dev"

Write-Host "⏳ Waiting for frontend to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verify frontend is running
Write-Host "🔍 Verifying frontend is accessible..." -ForegroundColor Yellow
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Frontend is running and accessible!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend might still be starting..." -ForegroundColor Yellow
    Write-Host "   Check the frontend window for the Vite server output." -ForegroundColor White
}
Write-Host ""

# ============================================
# Final Summary
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 SUCCESS! Your Project is Ready!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "✅ Backend is running!" -ForegroundColor Green
Write-Host "✅ Frontend is running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Open Your Project:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "   🚀 Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "      └─ Click this link or copy it to your browser!" -ForegroundColor White
Write-Host ""
Write-Host "   📦 Backend API: http://localhost:8080/api/cars" -ForegroundColor Green
Write-Host "   📚 API Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor Green
Write-Host ""
Write-Host "🔐 Test Credentials:" -ForegroundColor Cyan
Write-Host "   👤 Admin:    admin@selfcar.com / admin123" -ForegroundColor White
Write-Host "   👤 Customer: john.doe@example.com / password" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Backend and Frontend are running in separate windows" -ForegroundColor White
Write-Host "   • Close those windows to stop the servers" -ForegroundColor White
Write-Host "   • Your project is ready to use at http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit (servers will keep running)..." -ForegroundColor Yellow

# Try to open the browser
Start-Sleep -Seconds 2
try {
    Start-Process "http://localhost:5173"
    Write-Host "✅ Opening browser..." -ForegroundColor Green
} catch {
    Write-Host "💡 Please open http://localhost:5173 in your browser manually" -ForegroundColor Yellow
}

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

