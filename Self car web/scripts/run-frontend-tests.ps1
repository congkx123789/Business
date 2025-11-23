# SelfCar - Run Frontend Tests Script

Write-Host "🎨 Running Frontend Tests..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
$nodeVersion = node --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
}

Write-Host "Running unit tests..." -ForegroundColor Yellow
npm run test:run

$unitTestFailed = $false
if ($LASTEXITCODE -ne 0) {
    $unitTestFailed = $true
    Write-Host ""
    Write-Host "❌ Frontend unit tests failed!" -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "✅ Frontend unit tests passed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "To run E2E tests, use: npm run test:e2e" -ForegroundColor Yellow

Set-Location ..

if ($unitTestFailed) {
    exit 1
} else {
    exit 0
}

