# SelfCar - Fix Frontend Issues
# This script fixes common frontend startup issues

Write-Host ""
Write-Host "🔧 Fixing Frontend Issues..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

# Step 1: Check if port 5173 is in use
Write-Host "🔌 Step 1: Checking if port 5173 is available..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "⚠️  Port 5173 is in use by process: $($port5173.OwningProcess)" -ForegroundColor Yellow
    $response = Read-Host "Kill the process? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        try {
            Stop-Process -Id $port5173.OwningProcess -Force
            Write-Host "✅ Process killed" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "❌ Could not kill process. Please close it manually." -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ Port 5173 is available" -ForegroundColor Green
}
Write-Host ""

# Step 2: Clean install dependencies
Write-Host "📦 Step 2: Reinstalling dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   Removing old node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}

Write-Host "   Running npm install..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Verify Vite is installed
Write-Host "🔍 Step 3: Verifying Vite installation..." -ForegroundColor Yellow
if (Test-Path "node_modules\vite") {
    Write-Host "✅ Vite is installed" -ForegroundColor Green
} else {
    Write-Host "❌ Vite is not installed properly" -ForegroundColor Red
    Write-Host "   Installing Vite..." -ForegroundColor Yellow
    npm install vite --save-dev
}
Write-Host ""

# Step 4: Try to start the server
Write-Host "🚀 Step 4: Starting frontend server..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "📍 Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Vite development server..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm run dev

Set-Location ..

