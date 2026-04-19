# Port Conflict Checker (PowerShell)
# This script checks for port conflicts across all services

Write-Host "🔍 Checking for port conflicts..." -ForegroundColor Cyan
Write-Host ""

# Define port configuration
$portConfig = @{
    "1-gateway" = @{ http = 3000; grpc = $null }
    "users-service" = @{ http = 3001; grpc = 50051 }
    "stories-service" = @{ http = 3002; grpc = 50052 }
    "comments-service" = @{ http = 3003; grpc = 50053 }
    "search-service" = @{ http = 3004; grpc = 50054 }
    "ai-service" = @{ http = 3005; grpc = 50055 }
    "notification-service" = @{ http = 3006; grpc = 50056 }
    "websocket-service" = @{ http = 3007; grpc = 50057 }
    "social-service" = @{ http = 3008; grpc = 50058 }
    "community-service" = @{ http = 3009; grpc = 50059 }
    "monetization-service" = @{ http = 3010; grpc = 50060 }
    "3-web" = @{ http = 3000; grpc = $null }
}

# Infrastructure ports
$infraPorts = @{
    "SQL Server" = 1433
    "PostgreSQL" = 5433
    "Redis" = 6379
    "MeiliSearch" = 7700
}

# Collect all ports
$allPorts = @{}
$conflicts = @{}

foreach ($service in $portConfig.Keys) {
    $config = $portConfig[$service]
    if ($config.http) {
        $port = $config.http
        if ($allPorts.ContainsKey($port)) {
            if (-not $conflicts.ContainsKey($port)) {
                $conflicts[$port] = @()
            }
            $conflicts[$port] += $allPorts[$port]
            $conflicts[$port] += "$service (HTTP)"
        } else {
            $allPorts[$port] = "$service (HTTP)"
        }
    }
    if ($config.grpc) {
        $port = $config.grpc
        if ($allPorts.ContainsKey($port)) {
            if (-not $conflicts.ContainsKey($port)) {
                $conflicts[$port] = @()
            }
            $conflicts[$port] += $allPorts[$port]
            $conflicts[$port] += "$service (gRPC)"
        } else {
            $allPorts[$port] = "$service (gRPC)"
        }
    }
}

foreach ($infra in $infraPorts.Keys) {
    $port = $infraPorts[$infra]
    if ($allPorts.ContainsKey($port)) {
        if (-not $conflicts.ContainsKey($port)) {
            $conflicts[$port] = @()
        }
        $conflicts[$port] += $allPorts[$port]
        $conflicts[$port] += "$infra (Infrastructure)"
    } else {
        $allPorts[$port] = "$infra (Infrastructure)"
    }
}

# Display results
if ($conflicts.Count -eq 0) {
    Write-Host "✅ No port conflicts found!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Found $($conflicts.Count) port conflict(s):" -ForegroundColor Red
    Write-Host ""
    foreach ($port in $conflicts.Keys) {
        Write-Host "  Port $port is used by:" -ForegroundColor Yellow
        foreach ($usage in $conflicts[$port]) {
            Write-Host "    - $usage" -ForegroundColor White
        }
        Write-Host ""
    }
}

# Check for hardcoded ports in source files
Write-Host "🔍 Checking for hardcoded ports in source files..." -ForegroundColor Cyan
Write-Host ""

$hardcodedPorts = @()
$services = @(
    "packages\1-gateway\src\main.ts",
    "packages\2-services\users-service\src\main.ts",
    "packages\2-services\stories-service\src\main.ts",
    "packages\2-services\comments-service\src\main.ts",
    "packages\2-services\search-service\src\main.ts",
    "packages\2-services\ai-service\src\main.ts",
    "packages\2-services\notification-service\src\main.ts",
    "packages\2-services\websocket-service\src\main.ts",
    "packages\2-services\community-service\src\main.ts",
    "packages\2-services\monetization-service\src\main.ts",
    "packages\2-services\social-service\src\main.ts"
)

foreach ($file in $services) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        # Check for hardcoded app.listen(300X)
        if ($content -match 'app\.listen\((\d+)\)' -or $content -match 'await\s+app\.listen\((\d+)\)') {
            $matches = [regex]::Matches($content, 'app\.listen\((\d+)\)|await\s+app\.listen\((\d+)\)')
            foreach ($match in $matches) {
                $port = if ($match.Groups[1].Value) { $match.Groups[1].Value } else { $match.Groups[2].Value }
                if ($port -ge 3000 -and $port -le 3010) {
                    $hardcodedPorts += @{
                        File = $file
                        Port = $port
                    }
                }
            }
        }
    }
}

if ($hardcodedPorts.Count -eq 0) {
    Write-Host "✅ No hardcoded ports found!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  Found $($hardcodedPorts.Count) hardcoded port(s):" -ForegroundColor Yellow
    Write-Host ""
    foreach ($item in $hardcodedPorts) {
        Write-Host "  Port $($item.Port) in $($item.File)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "💡 Run 'pnpm run fix:ports' to automatically fix" -ForegroundColor Cyan
    Write-Host ""
}

# Check if ports are currently in use
Write-Host "🔍 Checking if ports are currently in use..." -ForegroundColor Cyan
Write-Host ""

$inUsePorts = @()
foreach ($port in $allPorts.Keys) {
    $result = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($result) {
        $inUsePorts += $port
        Write-Host "  ⚠️  Port $port is currently in use by: $($allPorts[$port])" -ForegroundColor Yellow
    }
}

if ($inUsePorts.Count -eq 0) {
    Write-Host "  ✅ No ports are currently in use" -ForegroundColor Green
    Write-Host ""
}

# Summary
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total ports configured: $($allPorts.Count)"
Write-Host "  Conflicts: $($conflicts.Count)"
Write-Host "  Hardcoded ports: $($hardcodedPorts.Count)"
Write-Host "  Ports in use: $($inUsePorts.Count)"
Write-Host ""

if ($conflicts.Count -gt 0 -or $hardcodedPorts.Count -gt 0) {
    Write-Host "💡 Run 'pnpm run fix:ports' to automatically fix conflicts" -ForegroundColor Yellow
    exit 1
}

exit 0

