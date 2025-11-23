# SelfCar - Run Project Roadmap Script
# This script follows the roadmap: Start Backend → Start Frontend → Run Tests

Write-Host ""
Write-Host "🗺️  SelfCar Project - Roadmap Execution" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 0: Check prerequisites
Write-Host "📋 STEP 0: Checking Prerequisites..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

$nodeVersion = node --version 2>$null
$javaVersion = java --version 2>$null
$mvnVersion = mvn --version 2>$null

$allPrereqs = $true

if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    $allPrereqs = $false
} else {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}

if (-not $javaVersion) {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    $allPrereqs = $false
} else {
    Write-Host "✅ Java: Found" -ForegroundColor Green
}

if (-not $mvnVersion) {
    Write-Host "❌ Maven not found. Please install Maven 3.8+" -ForegroundColor Red
    $allPrereqs = $false
} else {
    Write-Host "✅ Maven: Found" -ForegroundColor Green
}

if (-not $allPrereqs) {
    Write-Host ""
    Write-Host "❌ Prerequisites check failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites OK" -ForegroundColor Green
Write-Host ""

# Ask user if they want to proceed
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Start Backend Server (http://localhost:8080)" -ForegroundColor White
Write-Host "  2. Start Frontend Server (http://localhost:5173)" -ForegroundColor White
Write-Host "  3. Wait for both to be ready" -ForegroundColor White
Write-Host "  4. Run all tests" -ForegroundColor White
Write-Host ""
$response = Read-Host "Continue? (Y/N)"
if ($response -ne "Y" -and $response -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Backend
Write-Host "📦 STEP 1: Starting Backend Server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Backend will run on: http://localhost:8080" -ForegroundColor Cyan
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
    mvn spring-boot:run"

Write-Host "⏳ Waiting for backend to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if backend is responding
Write-Host "🔍 Checking if backend is ready..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/cars" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is ready!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Backend is starting (may take a bit longer)..." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Start Frontend
Write-Host "🎨 STEP 2: Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "cd '$PWD\frontend'; `$
    Write-Host '🎨 SelfCar Frontend Server' -ForegroundColor Cyan; `$
    Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
    Write-Host ''; `$
    Write-Host 'Starting Vite...' -ForegroundColor Yellow; `$
    Write-Host '📍 URL: http://localhost:5173' -ForegroundColor Green; `$
    Write-Host ''; `$
    npm run dev"

Write-Host "⏳ Waiting for frontend to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "✅ Frontend starting!" -ForegroundColor Green
Write-Host ""

# Step 3: Wait a bit more for both to fully start
Write-Host "⏳ Waiting for both services to be fully ready (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 4: Run Tests
Write-Host "🧪 STEP 3: Running All Tests..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$testFailed = $false

# Backend tests
Write-Host "📦 Running Backend Tests..." -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location backend
mvn test --quiet
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

# Final Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($testFailed) {
    Write-Host "⚠️  Some tests failed, but services are running" -ForegroundColor Yellow
} else {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Project Status:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "✅ Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""

if (-not $testFailed) {
    Write-Host "✅ Tests: All passing" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tests: Some failures (see above)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📍 Test Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:    admin@selfcar.com / admin123" -ForegroundColor White
Write-Host "   Customer: john.doe@example.com / password" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit (services will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


