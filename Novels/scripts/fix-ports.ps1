# Automatic Port Conflict Fixer (PowerShell)
# This script automatically fixes port conflicts by updating source files

Write-Host "🔧 Fixing port conflicts..." -ForegroundColor Cyan
Write-Host ""

$fixedCount = 0

# Port mapping
$portMapping = @{
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
}

# Function to get service name from path
function Get-ServiceName {
    param([string]$FilePath)
    
    if ($FilePath -match "packages[\\/]1-gateway") {
        return "1-gateway"
    }
    if ($FilePath -match "packages[\\/]2-services[\\/]([^\\/]+)") {
        return $matches[1]
    }
    return $null
}

# Fix main.ts files
$mainTsFiles = @(
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

foreach ($file in $mainTsFiles) {
    if (-not (Test-Path $file)) {
        continue
    }
    
    $serviceName = Get-ServiceName $file
    if (-not $serviceName -or -not $portMapping.ContainsKey($serviceName)) {
        continue
    }
    
    $ports = $portMapping[$serviceName]
    $content = Get-Content $file -Raw
    $originalContent = $content
    $modified = $false
    
    # Fix HTTP port - replace hardcoded app.listen(300X) with configService
    if ($ports.http) {
        # Check if already using configService
        if ($content -match 'app\.listen\((\d+)\)' -and $content -notmatch 'configService\.get') {
            $content = $content -replace 'await\s+app\.listen\((\d+)\)', "await app.listen(configService.get<number>(`"app.port`", $($ports.http)))"
            $content = $content -replace 'app\.listen\((\d+)\)', "app.listen(configService.get<number>(`"app.port`", $($ports.http)))"
            $modified = $true
        }
        
        # Ensure ConfigService is imported
        if ($content -match 'configService' -and $content -notmatch 'import.*ConfigService') {
            if ($content -match 'import\s*\{([^}]+)\}\s*from\s*["'']@nestjs\/core["'']') {
                $imports = $matches[1]
                if ($imports -notmatch 'ConfigService') {
                    $content = $content -replace 'import\s*\{([^}]+)\}\s*from\s*["'']@nestjs\/core["'']', "import { $imports, ConfigService } from `"@nestjs/core`""
                    $modified = $true
                }
            }
        }
    }
    
    # Fix gRPC port
    if ($ports.grpc) {
        $grpcPattern = "0\.0\.0\.0:$($ports.grpc)"
        if ($content -match $grpcPattern -and $content -notmatch 'configService\.get.*grpcUrl') {
            $envVarName = $serviceName.ToUpper().Replace("-", "_") + "_GRPC_URL"
            $content = $content -replace "`"0\.0\.0\.0:$($ports.grpc)`"", "configService.get<string>(`"app.grpcUrl`", `"0.0.0.0:$($ports.grpc)`")"
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "  ✅ Fixed $file" -ForegroundColor Green
        $fixedCount++
    }
}

# Fix configuration.ts files
$configFiles = @(
    "packages\1-gateway\src\config\configuration.ts",
    "packages\2-services\users-service\src\config\configuration.ts",
    "packages\2-services\stories-service\src\config\configuration.ts",
    "packages\2-services\comments-service\src\config\configuration.ts",
    "packages\2-services\search-service\src\config\configuration.ts",
    "packages\2-services\ai-service\src\config\configuration.ts",
    "packages\2-services\notification-service\src\config\configuration.ts",
    "packages\2-services\websocket-service\src\config\configuration.ts",
    "packages\2-services\community-service\src\config\configuration.ts",
    "packages\2-services\monetization-service\src\config\configuration.ts"
)

foreach ($file in $configFiles) {
    if (-not (Test-Path $file)) {
        continue
    }
    
    $serviceName = Get-ServiceName $file
    if (-not $serviceName -or -not $portMapping.ContainsKey($serviceName)) {
        continue
    }
    
    $ports = $portMapping[$serviceName]
    $content = Get-Content $file -Raw
    $modified = $false
    
    # Fix HTTP port in config
    if ($ports.http) {
        $envVarName = $serviceName.ToUpper().Replace("-", "_") + "_PORT"
        # Check if port is hardcoded with wrong value
        if ($content -match "port:\s*toNumber\([^,]+,\s*(\d+)\)") {
            $currentPort = [int]$matches[1]
            if ($currentPort -ne $ports.http) {
                $content = $content -replace "port:\s*toNumber\([^,]+,\s*\d+\)", "port: toNumber(process.env.$envVarName, $($ports.http))"
                $modified = $true
            }
        }
    }
    
    # Fix gRPC port in config
    if ($ports.grpc) {
        $envVarName = $serviceName.ToUpper().Replace("-", "_") + "_GRPC_URL"
        if ($content -match "grpcUrl:\s*process\.env\.[^,]+[^?]*\?\?\s*["'']0\.0\.0\.0:(\d+)["'']") {
            $currentPort = [int]$matches[1]
            if ($currentPort -ne $ports.grpc) {
                $content = $content -replace "grpcUrl:\s*process\.env\.[^,]+[^?]*\?\?\s*["'']0\.0\.0\.0:\d+["'']", "grpcUrl: process.env.$envVarName ?? `"0.0.0.0:$($ports.grpc)`""
                $modified = $true
            }
        }
    }
    
    if ($modified) {
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "  ✅ Fixed $file" -ForegroundColor Green
        $fixedCount++
    }
}

Write-Host ""
Write-Host "✅ Fixed $fixedCount file(s)" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Run 'pnpm run check:ports' to verify the fixes" -ForegroundColor Cyan

