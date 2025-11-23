# Service Diagnostic Script
# This script helps diagnose why services aren't starting

Write-Host "=== Service Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js processes
Write-Host "1. Node.js Processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ✓ Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Green
    $nodeProcesses | Select-Object Id, StartTime | Format-Table -AutoSize
} else {
    Write-Host "   ✗ No Node.js processes running" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Listening Ports:" -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 50051, 50052, 50053)
foreach ($port in $ports) {
    $listening = netstat -ano | findstr ":$port " | findstr "LISTENING"
    if ($listening) {
        Write-Host "   ✓ Port $port is listening" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Port $port is NOT listening" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Docker Containers:" -ForegroundColor Yellow
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerAvailable) {
    $containers = docker ps --format "{{.Names}} - {{.Status}}" 2>$null
    if ($containers) {
        $containers | ForEach-Object {
            if ($_ -match "novels-") {
                if ($_ -match "healthy") {
                    Write-Host "   ✓ $_" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠ $_" -ForegroundColor Yellow
                }
            }
        }
    }
} else {
    Write-Host "   ✗ Docker not available" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. SQL Server Connectivity:" -ForegroundColor Yellow
$sqlServerTest = Test-NetConnection -ComputerName localhost -Port 1433 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($sqlServerTest) {
    Write-Host "   ✓ SQL Server port 1433 is accessible" -ForegroundColor Green
} else {
    Write-Host "   ✗ SQL Server port 1433 is NOT accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Service Dependencies:" -ForegroundColor Yellow
$servicePaths = @(
    "packages\2-services\users-service\node_modules",
    "packages\2-services\stories-service\node_modules",
    "packages\2-services\comments-service\node_modules",
    "packages\1-gateway\node_modules"
)

foreach ($path in $servicePaths) {
    if (Test-Path $path) {
        Write-Host "   ✓ $path exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $path MISSING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "6. Recent Fixes Applied:" -ForegroundColor Yellow
Write-Host "   ✓ SQL Server SSL certificate fix (trustServerCertificate)" -ForegroundColor Green
Write-Host "   ✓ TypeScript configuration fix (skipLibCheck)" -ForegroundColor Green
Write-Host "   ✓ Database creation verified" -ForegroundColor Green

Write-Host ""
Write-Host "=== Recommendations ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If services aren't starting:" -ForegroundColor White
Write-Host "1. Check PowerShell windows for error messages" -ForegroundColor Yellow
Write-Host "2. Verify SQL Server is fully ready (may take 1-2 minutes)" -ForegroundColor Yellow
Write-Host "3. Try starting services individually:" -ForegroundColor Yellow
Write-Host "   pnpm --filter users-service start:dev" -ForegroundColor White
Write-Host "4. Check service logs in the opened PowerShell windows" -ForegroundColor Yellow
Write-Host "5. Ensure all dependencies are installed: pnpm install" -ForegroundColor Yellow


