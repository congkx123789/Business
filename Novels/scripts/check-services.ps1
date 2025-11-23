# Check Services Status Script
# This script checks if all services are running and accessible

Write-Host "=== Checking Service Status ===" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{ Name = "PostgreSQL"; Port = 5432; Type = "Database" },
    @{ Name = "Redis"; Port = 6379; Type = "Cache" },
    @{ Name = "MeiliSearch"; Port = 7700; Type = "Search" },
    @{ Name = "Users Service (gRPC)"; Port = 50051; Type = "Microservice" },
    @{ Name = "Stories Service (gRPC)"; Port = 50052; Type = "Microservice" },
    @{ Name = "Comments Service (gRPC)"; Port = 50053; Type = "Microservice" },
    @{ Name = "API Gateway"; Port = 3001; Type = "Gateway"; Url = "http://localhost:3001/api" },
    @{ Name = "Web Frontend"; Port = 3000; Type = "Frontend"; Url = "http://localhost:3000" }
)

$allRunning = $true

foreach ($service in $services) {
    $port = $service.Port
    $name = $service.Name
    $type = $service.Type
    
    # Check if port is listening
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet -ErrorAction SilentlyContinue
    
    if ($connection) {
        Write-Host "✓ $name ($type) - Port $port is open" -ForegroundColor Green
        
        # If there's a URL, try to access it
        if ($service.Url) {
            try {
                $response = Invoke-WebRequest -Uri $service.Url -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
                    Write-Host "  → $($service.Url) is responding" -ForegroundColor Green
                }
            } catch {
                # Service might be running but not ready yet
                Write-Host "  → $($service.Url) is starting..." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "✗ $name ($type) - Port $port is not open" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""
Write-Host "=== Docker Containers ===" -ForegroundColor Cyan

$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerAvailable) {
    try {
        $containers = docker ps --format "{{.Names}} - {{.Status}}" 2>$null
        if ($containers) {
            $containers | ForEach-Object {
                if ($_ -match "novels-") {
                    Write-Host "✓ $_" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "No containers running" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Could not check Docker containers" -ForegroundColor Yellow
    }
} else {
    Write-Host "Docker is not available" -ForegroundColor Yellow
}

Write-Host ""
if ($allRunning) {
    Write-Host "=== All Services Running! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "  - Web Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  - API Gateway: http://localhost:3001/api" -ForegroundColor White
    Write-Host "  - GraphQL: http://localhost:3001/graphql" -ForegroundColor White
} else {
    Write-Host "=== Some Services Not Running ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start all services, run:" -ForegroundColor Cyan
    Write-Host "  pnpm start:all" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor White
    Write-Host "  pnpm start:all:single" -ForegroundColor White
}


