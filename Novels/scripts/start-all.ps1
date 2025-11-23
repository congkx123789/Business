# Start All Services Script
# This script starts all microservices, gateway, and web frontend

Write-Host "=== Starting Novels Monorepo Services ===" -ForegroundColor Cyan
Write-Host ""

# Check if pnpm is available
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: pnpm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install pnpm: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# Function to start a service in a new window
function Start-ServiceInWindow {
    param(
        [string]$ServiceName,
        [string]$Command
    )

    Write-Host "Starting $ServiceName..." -ForegroundColor Yellow
    $escapedPath = $PWD.Path.Replace("'", "''")
    $psCommand = "Set-Location -LiteralPath '$escapedPath'; $Command"
    Start-Process -FilePath "pwsh" -ArgumentList @("-NoExit", "-Command", $psCommand) -WorkingDirectory $PWD -WindowStyle Normal
    Start-Sleep -Seconds 2
}

Write-Host "Starting infrastructure check..." -ForegroundColor Cyan
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    Write-Host "✓ Docker is available" -ForegroundColor Green
    Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 5
} else {
    Write-Host "⚠ Docker is not available" -ForegroundColor Yellow
    Write-Host "Infrastructure services (PostgreSQL, Redis, MeiliSearch) need to be running manually" -ForegroundColor Yellow
    Write-Host "See DEVELOPMENT_WITHOUT_DOCKER.md for manual setup instructions" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "Starting microservices..." -ForegroundColor Cyan

# Start microservices in separate windows
Start-ServiceInWindow "Users Service" "pnpm --filter users-service start:dev"
Start-ServiceInWindow "Stories Service" "pnpm --filter stories-service start:dev"
Start-ServiceInWindow "Comments Service" "pnpm --filter comments-service start:dev"
Start-ServiceInWindow "Search Service" "pnpm --filter search-service start:dev"
Start-ServiceInWindow "AI Service" "pnpm --filter ai-service start:dev"
Start-ServiceInWindow "Notification Service" "pnpm --filter notification-service start:dev"
Start-ServiceInWindow "WebSocket Service" "pnpm --filter websocket-service start:dev"

Write-Host ""
Write-Host "Starting API Gateway..." -ForegroundColor Cyan
Start-ServiceInWindow "API Gateway" "pnpm --filter 1-gateway start:dev"

Write-Host ""
Write-Host "Starting Web Frontend..." -ForegroundColor Cyan
Start-ServiceInWindow "Web Frontend" "pnpm --filter 3-web dev"

Write-Host ""
Write-Host "=== All Services Started ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services are running in separate windows:" -ForegroundColor Cyan
Write-Host "  - API Gateway: http://localhost:3001/api" -ForegroundColor White
Write-Host "  - GraphQL: http://localhost:3001/graphql" -ForegroundColor White
Write-Host "  - Web Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services, close the PowerShell windows or press Ctrl+C in each window" -ForegroundColor Yellow


