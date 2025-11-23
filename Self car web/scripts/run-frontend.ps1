# SelfCar - Run Frontend Script

Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
$nodeVersion = node --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Write-Host "💡 Try running: ..\fix-frontend.ps1" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
}

# Check if port 5173 is in use
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "⚠️  Port 5173 is already in use!" -ForegroundColor Yellow
    Write-Host "   Process ID: $($port5173.OwningProcess)" -ForegroundColor White
    $response = Read-Host "Kill the process and continue? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        try {
            Stop-Process -Id $port5173.OwningProcess -Force
            Start-Sleep -Seconds 2
            Write-Host "✅ Port 5173 is now available" -ForegroundColor Green
        } catch {
            Write-Host "❌ Could not free port 5173. Please close it manually." -ForegroundColor Red
            Set-Location ..
            exit 1
        }
    } else {
        Write-Host "Cancelled." -ForegroundColor Yellow
        Set-Location ..
        exit 0
    }
}

Write-Host "📍 Frontend will run on: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting Vite development server..." -ForegroundColor Cyan
Write-Host "If you see errors, try: ..\fix-frontend.ps1" -ForegroundColor Yellow
Write-Host ""

npm run dev

