# Kill All Services Script
# This script kills all Node.js processes that might be running services

Write-Host "=== Killing All Service Processes ===" -ForegroundColor Yellow
Write-Host ""

# Get all Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Cyan
    
    # Check which ports are in use
    Write-Host ""
    Write-Host "Checking ports..." -ForegroundColor Cyan
    
    $ports = @(
        @{ Port = 3001; Service = "Gateway" },
        @{ Port = 3002; Service = "Users Service" },
        @{ Port = 3003; Service = "Stories Service" },
        @{ Port = 3004; Service = "Comments Service" },
        @{ Port = 3005; Service = "Search Service" },
        @{ Port = 3006; Service = "AI Service" },
        @{ Port = 3007; Service = "Notification Service" },
        @{ Port = 3008; Service = "WebSocket Service" },
        @{ Port = 50051; Service = "Users gRPC" },
        @{ Port = 50052; Service = "Stories gRPC" },
        @{ Port = 50053; Service = "Comments gRPC" },
        @{ Port = 50054; Service = "Search gRPC" },
        @{ Port = 50055; Service = "AI gRPC" }
    )
    
    foreach ($portInfo in $ports) {
        $port = $portInfo.Port
        $service = $portInfo.Service
        
        $connection = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
        if ($connection) {
            $pid = ($connection -split '\s+')[-1]
            Write-Host "  Port $port ($service) is used by PID $pid" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    $confirm = Read-Host "Kill all Node.js processes? (y/n)"
    
    if ($confirm -eq "y") {
        Write-Host "Killing Node.js processes..." -ForegroundColor Red
        $nodeProcesses | Stop-Process -Force
        Write-Host "✓ All Node.js processes killed" -ForegroundColor Green
    } else {
        Write-Host "Cancelled" -ForegroundColor Yellow
    }
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan

