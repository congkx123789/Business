# SelfCar - Run Tests with Coverage Report
# This script runs all tests and generates coverage reports

Write-Host ""
Write-Host "🧪 Running Tests with Coverage..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking Prerequisites..." -ForegroundColor Yellow
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

Write-Host "✅ All prerequisites OK" -ForegroundColor Green
Write-Host ""

# Run Backend Tests with Coverage
Write-Host "📦 Running Backend Tests with Coverage..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location backend

$backendTestResult = mvn clean test jacoco:report
$backendExitCode = $LASTEXITCODE

if ($backendExitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Backend tests passed!" -ForegroundColor Green
    Write-Host "📍 Coverage report: backend\target\site\jacoco\index.html" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Run Frontend Tests with Coverage
Write-Host "🎨 Running Frontend Tests with Coverage..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location frontend

$frontendTestResult = npm run test:coverage
$frontendExitCode = $LASTEXITCODE

if ($frontendExitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Frontend tests passed!" -ForegroundColor Green
    Write-Host "📍 Coverage report: frontend\coverage\index.html" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host ""

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All Tests Passed with Coverage Reports!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Coverage Reports:" -ForegroundColor Cyan
Write-Host "   Backend:  backend\target\site\jacoco\index.html" -ForegroundColor White
Write-Host "   Frontend: frontend\coverage\index.html" -ForegroundColor White
Write-Host ""
Write-Host "💡 Open these HTML files in your browser to view detailed coverage reports" -ForegroundColor Yellow
Write-Host ""

