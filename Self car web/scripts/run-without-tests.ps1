# SelfCar - Run Project Without Tests
# This script starts backend and frontend only (no tests)

Write-Host ""
Write-Host "🚀 Starting SelfCar Project (No Tests)..." -ForegroundColor Cyan
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

# Step 1: Start Backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Backend will run on: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📍 API Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PWD\backend'; `$
    Write-Host '📦 SelfCar Backend Server' -ForegroundColor Cyan; `$
    Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
    Write-Host ''; `$
    Write-Host 'Starting Spring Boot...' -ForegroundColor Yellow; `$
    Write-Host '📍 URL: http://localhost:8080' -ForegroundColor Green; `$
    Write-Host '📍 API: http://localhost:8080/api/cars' -ForegroundColor Green; `$
    Write-Host '📍 Docs: http://localhost:8080/swagger-ui.html' -ForegroundColor Green; `$
    Write-Host ''; `$
    Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow; `$
    Write-Host ''; `$
    mvn spring-boot:run"

Write-Host "⏳ Waiting for backend to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""

# Step 2: Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies (this may take a minute)..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Write-Host "💡 Try running: .\fix-frontend.ps1" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
    Set-Location ..
}

# Check if port 5173 is already in use
Write-Host "🔌 Checking if port 5173 is available..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "⚠️  Port 5173 is already in use!" -ForegroundColor Yellow
    Write-Host "   Process ID: $($port5173.OwningProcess)" -ForegroundColor White
    Write-Host "   Killing the process..." -ForegroundColor Yellow
    try {
        Stop-Process -Id $port5173.OwningProcess -Force -ErrorAction Stop
        Start-Sleep -Seconds 2
        Write-Host "✅ Port 5173 is now available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not free port 5173. Please close it manually." -ForegroundColor Red
        Write-Host "   Run: netstat -ano | findstr :5173" -ForegroundColor Yellow
    }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PWD\frontend'; `$
    Write-Host '🎨 SelfCar Frontend Server' -ForegroundColor Cyan; `$
    Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
    Write-Host ''; `$
    Write-Host 'Starting Vite...' -ForegroundColor Yellow; `$
    Write-Host '📍 URL: http://localhost:5173' -ForegroundColor Green; `$
    Write-Host ''; `$
    Write-Host 'If you see errors, check:' -ForegroundColor Yellow; `$
    Write-Host '  1. Dependencies installed (npm install)' -ForegroundColor White; `$
    Write-Host '  2. Port 5173 is available' -ForegroundColor White; `$
    Write-Host '  3. Node.js version is 18+' -ForegroundColor White; `$
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
    Write-Host "⚠️  Frontend might still be starting or there's an issue..." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check the frontend window for errors" -ForegroundColor White
    Write-Host "   2. Run: .\check-status.ps1 to diagnose" -ForegroundColor White
    Write-Host "   3. Run: .\fix-frontend.ps1 to fix common issues" -ForegroundColor White
    Write-Host ""
    Write-Host "   The frontend window should show the Vite server output." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Final Summary
Write-Host "✅ Project Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your Project is Running:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "✅ Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "   └─ API:   http://localhost:8080/api/cars" -ForegroundColor White
Write-Host "   └─ Docs:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "✅ Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "   └─ Open this in your browser to see your project!" -ForegroundColor White
Write-Host ""
Write-Host "📍 Test Credentials:" -ForegroundColor Cyan
Write-Host "   👤 Admin:    admin@selfcar.com / admin123" -ForegroundColor White
Write-Host "   👤 Customer: john.doe@example.com / password" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Backend and Frontend are running in separate windows" -ForegroundColor White
Write-Host "   • Close those windows to stop the servers" -ForegroundColor White
Write-Host "   • The browser will auto-open to http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To run tests later, use: .\run-tests.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit (servers will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

