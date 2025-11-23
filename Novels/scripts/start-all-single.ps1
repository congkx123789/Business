# Start All Services in Single Terminal (Background)
# Use this if you prefer all services in one terminal with output

Write-Host "=== Starting Novels Monorepo Services (Single Terminal) ===" -ForegroundColor Cyan
Write-Host ""

# Check infrastructure
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerAvailable) {
    Write-Host "Starting infrastructure..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 3
} else {
    Write-Host "⚠ Docker not available - infrastructure services need to be running manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting all services in background..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start services in background jobs
$jobs = @()

$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter users-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter stories-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter comments-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter search-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter ai-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter notification-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter websocket-service start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter 1-gateway start:dev }
$jobs += Start-Job -ScriptBlock { Set-Location $using:PWD; pnpm --filter 3-web dev }

Write-Host "All services started. Monitoring output..." -ForegroundColor Green
Write-Host ""

# Monitor jobs
try {
    while ($true) {
        $jobs | ForEach-Object {
            if ($_.State -eq "Running") {
                $output = Receive-Job -Job $_ -ErrorAction SilentlyContinue
                if ($output) {
                    Write-Host $output
                }
            }
        }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "All services stopped." -ForegroundColor Green
}


