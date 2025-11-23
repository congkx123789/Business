# Restart All Services and Monitor Script
# This script kills all services, restarts them, and monitors their status

param(
    [int]$WaitTime = 20,  # Wait time in seconds for services to start (increased for slower services)
    [switch]$SkipKill,    # Skip killing existing processes
    [switch]$ShowAllErrors # Show all errors without truncation (default: show first 20 per service)
)

Write-Host "=== Restart and Monitor All Services ===" -ForegroundColor Cyan
if ($ShowAllErrors) {
    Write-Host "  Mode: Showing ALL errors (no truncation)" -ForegroundColor Yellow
}
Write-Host ""

# Step 1: Kill all existing Node.js processes
if (-not $SkipKill) {
    Write-Host "Step 1: Killing all existing Node.js processes..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "  Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Cyan
        $nodeProcesses | Stop-Process -Force
        Write-Host "  ✓ All Node.js processes killed" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  No Node.js processes found" -ForegroundColor Green
    }
} else {
    Write-Host "Step 1: Skipping kill (--SkipKill flag set)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Check infrastructure (Docker)
Write-Host "Step 2: Checking infrastructure..." -ForegroundColor Yellow
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerAvailable) {
    Write-Host "  Docker is available" -ForegroundColor Green
    Write-Host "  Starting infrastructure services..." -ForegroundColor Cyan
    docker compose up -d
    Start-Sleep -Seconds 5
    
    # Check container status
    $containers = docker ps --format "{{.Names}} - {{.Status}}" 2>$null
    if ($containers) {
        Write-Host "  Infrastructure containers:" -ForegroundColor Cyan
        $containers | ForEach-Object {
            if ($_ -match "novels-") {
                Write-Host "    ✓ $_" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "  ⚠ Docker is not available" -ForegroundColor Yellow
    Write-Host "  Infrastructure services need to be running manually" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Start all services
Write-Host "Step 3: Starting all services..." -ForegroundColor Yellow
Write-Host "  This will open services in separate PowerShell windows" -ForegroundColor Cyan
Write-Host "  Error logs will be captured in logs/ directory" -ForegroundColor Cyan
Write-Host ""

# Create logs directory if it doesn't exist
$logsDir = Join-Path $PWD "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Function to start a service in a new window with error logging
function Start-ServiceInWindow {
    param(
        [string]$ServiceName,
        [string]$Command,
        [string]$LogFile
    )

    Write-Host "  Starting $ServiceName..." -ForegroundColor Yellow
    $escapedPath = $PWD.Path.Replace("'", "''")
    
    # Ensure log file path is absolute and properly constructed
    $logFileFullPath = $LogFile
    if (-not [System.IO.Path]::IsPathRooted($LogFile)) {
        $logFileFullPath = Join-Path $PWD.Path $LogFile
    }
    # Normalize the path to avoid duplicates
    $absoluteLogFile = [System.IO.Path]::GetFullPath($logFileFullPath)
    
    # Ensure the directory exists
    $logDir = [System.IO.Path]::GetDirectoryName($absoluteLogFile)
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    $escapedLogFile = $absoluteLogFile.Replace("'", "''")
    
    # Create a script that captures ALL output (stdout + stderr) and logs everything
    $scriptContent = @"
`$ErrorActionPreference = 'Continue'
Set-Location -LiteralPath '$escapedPath'
`$logFile = '$escapedLogFile'

# Initialize log file with header
`$header = "========================================`n"
`$header += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting $ServiceName`n"
`$header += "Log file: `$logFile`n"
`$header += "Command: $Command`n"
`$header += "========================================`n"
Add-Content -Path `$logFile -Value `$header -ErrorAction SilentlyContinue

Write-Host "Starting $ServiceName..." -ForegroundColor Cyan
Write-Host "Log file: `$logFile" -ForegroundColor Gray
Write-Host "All output will be captured to the log file" -ForegroundColor Gray

# Function to add timestamp and write to log
function Write-ToLog {
    param([string]`$Message)
    if (`$Message) {
        `$timestamped = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] `$Message"
        Add-Content -Path `$logFile -Value `$timestamped -ErrorAction SilentlyContinue
    }
}

# Capture ALL output using Tee-Object - this captures both stdout and stderr
# 2>&1 redirects stderr to stdout, so everything goes through the pipeline
try {
    # Execute command and capture ALL output (stdout + stderr) to both console and log file
    Invoke-Expression "$Command" 2>&1 | ForEach-Object {
        `$line = `$_
        # Write to console (with original formatting)
        Write-Host `$line
        # Write to log file with timestamp
        Write-ToLog `$line
    }
} catch {
    `$errorMsg = "[ERROR] $ServiceName : `$_"
    Write-Host `$errorMsg -ForegroundColor Red
    Write-ToLog `$errorMsg
    
    # Also log stack trace if available
    if (`$_.Exception.StackTrace) {
        `$stackTrace = "Stack Trace: `$(`$_.Exception.StackTrace)"
        Write-ToLog `$stackTrace
    }
    
    # Log exit
    `$footer = "`n========================================`n"
    `$footer += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Service $ServiceName exited with error`n"
    `$footer += "========================================`n"
    Add-Content -Path `$logFile -Value `$footer -ErrorAction SilentlyContinue
    
    throw
}

# Log normal exit
`$footer = "`n========================================`n"
`$footer += "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Service $ServiceName stopped normally`n"
`$footer += "========================================`n"
Add-Content -Path `$logFile -Value `$footer -ErrorAction SilentlyContinue
"@
    
    $tempScript = Join-Path $env:TEMP "start-service-$([System.IO.Path]::GetRandomFileName()).ps1"
    $scriptContent | Out-File -FilePath $tempScript -Encoding UTF8
    
    $psCommand = "& '$tempScript'"
    Start-Process -FilePath "pwsh" -ArgumentList @("-NoExit", "-Command", $psCommand) -WorkingDirectory $PWD -WindowStyle Normal
    Start-Sleep -Seconds 1
}

# Service definitions with log files
$serviceDefinitions = @(
    @{ Name = "Users Service"; Command = "cmd.exe /c pnpm --filter users-service start:dev"; LogFile = "logs/users-service.log" },
    @{ Name = "Stories Service"; Command = "cmd.exe /c pnpm --filter stories-service start:dev"; LogFile = "logs/stories-service.log" },
    @{ Name = "Comments Service"; Command = "cmd.exe /c pnpm --filter comments-service start:dev"; LogFile = "logs/comments-service.log" },
    @{ Name = "Search Service"; Command = "cmd.exe /c pnpm --filter search-service start:dev"; LogFile = "logs/search-service.log" },
    @{ Name = "AI Service"; Command = "cmd.exe /c pnpm --filter ai-service start:dev"; LogFile = "logs/ai-service.log" },
    @{ Name = "Notification Service"; Command = "cmd.exe /c pnpm --filter notification-service start:dev"; LogFile = "logs/notification-service.log" },
    @{ Name = "WebSocket Service"; Command = "cmd.exe /c pnpm --filter websocket-service start:dev"; LogFile = "logs/websocket-service.log" },
    @{ Name = "Social Service"; Command = "cmd.exe /c pnpm --filter social-service start:dev"; LogFile = "logs/social-service.log" },
    @{ Name = "Community Service"; Command = "cmd.exe /c pnpm --filter community-service start:dev"; LogFile = "logs/community-service.log" },
    @{ Name = "Monetization Service"; Command = "cmd.exe /c pnpm --filter monetization-service start:dev"; LogFile = "logs/monetization-service.log" },
    @{ Name = "API Gateway"; Command = "cmd.exe /c pnpm --filter 1-gateway start:dev"; LogFile = "logs/gateway.log" },
    @{ Name = "Web Frontend"; Command = "cmd.exe /c pnpm --filter 3-web dev"; LogFile = "logs/web-frontend.log" }
)

# Clear old log files
foreach ($svc in $serviceDefinitions) {
    $logPath = Join-Path $PWD $svc.LogFile
    if (Test-Path $logPath) {
        Clear-Content -Path $logPath -ErrorAction SilentlyContinue
    }
}

# Start all services
foreach ($svc in $serviceDefinitions) {
    $logPath = Join-Path $PWD $svc.LogFile
    Start-ServiceInWindow -ServiceName $svc.Name -Command $svc.Command -LogFile $logPath
}

Write-Host ""
Write-Host "  Waiting $WaitTime seconds for services to start..." -ForegroundColor Cyan
Write-Host "  (Some services may take longer to connect to databases and start gRPC servers)" -ForegroundColor Yellow
Start-Sleep -Seconds $WaitTime

Write-Host ""

# Step 4: Check service status
Write-Host "Step 4: Checking service status..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{ Name = "PostgreSQL"; Port = 5432; Type = "Database" },
    @{ Name = "Redis"; Port = 6379; Type = "Cache" },
    @{ Name = "MeiliSearch"; Port = 7700; Type = "Search" },
    @{ Name = "SQL Server"; Port = 1433; Type = "Database" },
    @{ Name = "Users Service (HTTP)"; Port = 3002; Type = "Microservice" },
    @{ Name = "Users Service (gRPC)"; Port = 50051; Type = "Microservice" },
    @{ Name = "Stories Service (HTTP)"; Port = 3003; Type = "Microservice" },
    @{ Name = "Stories Service (gRPC)"; Port = 50052; Type = "Microservice" },
    @{ Name = "Comments Service (HTTP)"; Port = 3004; Type = "Microservice" },
    @{ Name = "Comments Service (gRPC)"; Port = 50053; Type = "Microservice" },
    @{ Name = "Search Service (HTTP)"; Port = 3005; Type = "Microservice" },
    @{ Name = "Search Service (gRPC)"; Port = 50054; Type = "Microservice" },
    @{ Name = "AI Service (HTTP)"; Port = 3006; Type = "Microservice" },
    @{ Name = "AI Service (gRPC)"; Port = 50055; Type = "Microservice" },
    @{ Name = "Notification Service"; Port = 3007; Type = "Microservice" },
    @{ Name = "WebSocket Service"; Port = 3008; Type = "Microservice" },
    @{ Name = "API Gateway"; Port = 3001; Type = "Gateway"; Url = "http://localhost:3001/api" },
    @{ Name = "Web Frontend"; Port = 3000; Type = "Frontend"; Url = "http://localhost:3000" }
)

$allRunning = $true
$failedServices = @()
$serviceErrors = @{}
$endpointErrors = @()

foreach ($service in $services) {
    $port = $service.Port
    $name = $service.Name
    $type = $service.Type
    
    # Retry connection check up to 3 times with 2 second delay
    $connection = $false
    $retries = 3
    for ($i = 0; $i -lt $retries; $i++) {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet -ErrorAction SilentlyContinue
        if ($connection) {
            break
        }
        if ($i -lt $retries - 1) {
            Start-Sleep -Seconds 2
        }
    }
    
    if ($connection) {
        Write-Host "  ✓ $name ($type) - Port $port is open" -ForegroundColor Green
        
        # If there's a URL, try to access it
        if ($service.Url) {
            try {
                $response = Invoke-WebRequest -Uri $service.Url -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
                    Write-Host "    → $($service.Url) is responding" -ForegroundColor Green
                }
            } catch {
                Write-Host "    → $($service.Url) is starting..." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ✗ $name ($type) - Port $port is not open" -ForegroundColor Red
        $allRunning = $false
        $failedServices += $name
    }
}

Write-Host ""

# Step 5: Check for errors and warnings
Write-Host "Step 5: Checking for errors and warnings..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) Node.js processes running" -ForegroundColor Green
    Write-Host ""
    
    # Check HTTP endpoints for errors
    Write-Host "  Testing HTTP endpoints..." -ForegroundColor Cyan
    $endpoints = @(
        @{ Name = "API Gateway"; Url = "http://localhost:3001/api"; ExpectedStatus = @(200, 404) },
        @{ Name = "GraphQL"; Url = "http://localhost:3001/graphql"; ExpectedStatus = @(200, 400, 405) },
        @{ Name = "Web Frontend"; Url = "http://localhost:3000"; ExpectedStatus = @(200) },
        @{ Name = "Users Service"; Url = "http://localhost:3002"; ExpectedStatus = @(200, 404) },
        @{ Name = "Stories Service"; Url = "http://localhost:3003"; ExpectedStatus = @(200, 404) },
        @{ Name = "Comments Service"; Url = "http://localhost:3004"; ExpectedStatus = @(200, 404) },
        @{ Name = "Search Service"; Url = "http://localhost:3005"; ExpectedStatus = @(200, 404) },
        @{ Name = "AI Service"; Url = "http://localhost:3006"; ExpectedStatus = @(200, 404) },
        @{ Name = "Notification Service"; Url = "http://localhost:3007"; ExpectedStatus = @(200, 404) },
        @{ Name = "WebSocket Service"; Url = "http://localhost:3008"; ExpectedStatus = @(200, 404) }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri $endpoint.Url -Method Get -TimeoutSec 3 -ErrorAction Stop
            if ($endpoint.ExpectedStatus -contains $response.StatusCode) {
                Write-Host "    ✓ $($endpoint.Name) - Status: $($response.StatusCode)" -ForegroundColor Green
            } else {
                Write-Host "    ⚠ $($endpoint.Name) - Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
                $endpointErrors += "$($endpoint.Name): Unexpected status $($response.StatusCode)"
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -and ($endpoint.ExpectedStatus -contains $statusCode)) {
                Write-Host "    ✓ $($endpoint.Name) - Status: $statusCode" -ForegroundColor Green
            } else {
                Write-Host "    ✗ $($endpoint.Name) - Not responding or error" -ForegroundColor Red
                $endpointErrors += "$($endpoint.Name): $($_.Exception.Message)"
            }
        }
    }
    
    Write-Host ""
    
    # Check Docker container logs for errors
    if ($dockerAvailable) {
        Write-Host "  Checking Docker container logs..." -ForegroundColor Cyan
        $containers = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -match "novels-" }
        foreach ($container in $containers) {
            $logs = docker logs --tail 10 $container 2>&1 | Select-String -Pattern "error|Error|ERROR|warn|Warn|WARN|failed|Failed|FAILED" -CaseSensitive:$false
            if ($logs) {
                Write-Host "    ⚠ $container has warnings/errors in recent logs:" -ForegroundColor Yellow
                $logs | Select-Object -First 3 | ForEach-Object {
                    Write-Host "      $_" -ForegroundColor Yellow
                }
            } else {
                Write-Host "    ✓ $container - No recent errors" -ForegroundColor Green
            }
        }
    }
    
Write-Host ""
    
    # Check log files for errors
    Write-Host "  Checking service log files for errors..." -ForegroundColor Cyan
    
    foreach ($svc in $serviceDefinitions) {
        $logPath = Join-Path $PWD $svc.LogFile
        if (Test-Path $logPath) {
            $logContent = Get-Content -Path $logPath -ErrorAction SilentlyContinue
            if ($logContent) {
                # Look for error patterns, but exclude false positives
                $errorPattern = "error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION|Cannot|cannot|not found|NotFound|Missing|missing|resolve dependencies|dependency|unhandled|Unhandled"
                $falsePositives = @("Found 0 errors", "No errors", "no errors found", "watching for file changes", "file changes", "compiled successfully", "successfully compiled")
                
                $allMatches = $logContent | Select-String -Pattern $errorPattern -CaseSensitive:$false
                if ($allMatches) {
                    # Filter out false positives
                    $errors = $allMatches | Where-Object { 
                        $line = $_.Line
                        $isFalsePositive = $false
                        foreach ($fp in $falsePositives) {
                            if ($line -match [regex]::Escape($fp)) {
                                $isFalsePositive = $true
                                break
                            }
                        }
                        -not $isFalsePositive
                    }
                    
                    if ($errors) {
                        $serviceErrors[$svc.Name] = $errors
                        Write-Host "    ⚠ $($svc.Name) has errors in log file ($($errors.Count) error(s))" -ForegroundColor Yellow
                    } else {
                        Write-Host "    ✓ $($svc.Name) - No errors in log file" -ForegroundColor Green
                    }
                } else {
                    Write-Host "    ✓ $($svc.Name) - No errors in log file" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "    ⚠ $($svc.Name) - Log file not created yet" -ForegroundColor Yellow
        }
    }
    
    # Display detailed errors
    if ($serviceErrors.Count -gt 0) {
        Write-Host ""
        Write-Host "  ⚠ Detailed Errors from Service Logs:" -ForegroundColor Red
        Write-Host ""
        
        foreach ($svcName in $serviceErrors.Keys) {
            $errors = $serviceErrors[$svcName]
            $maxErrors = if ($ShowAllErrors) { $errors.Count } else { 20 }
            $errorCount = [Math]::Min($errors.Count, $maxErrors)
            
            Write-Host "  ┌─ $svcName Errors ($($errors.Count) total) ─────────────────────────────────" -ForegroundColor Red
            Write-Host ""
            
            for ($i = 0; $i -lt $errorCount; $i++) {
                $errorLine = $errors[$i].Line.Trim()
                $lineNumber = $errors[$i].LineNumber
                
                # Show full error line (no truncation)
                Write-Host "  │ Line $lineNumber :" -ForegroundColor DarkGray
                Write-Host "  │ $errorLine" -ForegroundColor Yellow
                Write-Host ""
            }
            
            if ($errors.Count -gt $maxErrors) {
                Write-Host "  │ ... and $($errors.Count - $maxErrors) more errors" -ForegroundColor Gray
                Write-Host "  │ Use -ShowAllErrors flag to see all errors" -ForegroundColor Gray
                Write-Host ""
            }
            
            Write-Host "  └──────────────────────────────────────────────────────────────" -ForegroundColor Red
            Write-Host ""
            
            $matchingSvc = $serviceDefinitions | Where-Object { $_.Name -eq $svcName } | Select-Object -First 1
            if ($matchingSvc) {
                $logPath = Join-Path $PWD $matchingSvc.LogFile
                Write-Host "    📄 Full log file: $logPath" -ForegroundColor Cyan
                Write-Host "    💡 View all errors: Get-Content '$logPath' | Select-String -Pattern 'error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION' -CaseSensitive:`$false" -ForegroundColor Gray
            }
            Write-Host ""
        }
    }
    
Write-Host ""
Write-Host "  📝 Logging Information:" -ForegroundColor Cyan
Write-Host "    • All terminal output from each service is captured in log files" -ForegroundColor White
Write-Host "    • Each log entry includes a timestamp" -ForegroundColor White
Write-Host "    • Log files are saved in: $logsDir" -ForegroundColor White
Write-Host "    • You can also check the PowerShell windows for real-time output" -ForegroundColor White
Write-Host ""
    
    if ($endpointErrors.Count -gt 0) {
        Write-Host ""
        Write-Host "  ⚠ Endpoint Errors Found:" -ForegroundColor Yellow
        foreach ($err in $endpointErrors) {
            Write-Host "    - $err" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ⚠ No Node.js processes found - services may not have started" -ForegroundColor Red
    Write-Host "  Check the PowerShell windows that were opened for error messages" -ForegroundColor Yellow
    Write-Host "  Check log files in: $logsDir" -ForegroundColor Yellow
    
    # Still check log files for errors even if no processes are running
    Write-Host ""
    Write-Host "  Checking log files for startup errors..." -ForegroundColor Cyan
    foreach ($svc in $serviceDefinitions) {
        $logPath = Join-Path $PWD $svc.LogFile
        if (Test-Path $logPath) {
            $logContent = Get-Content -Path $logPath -ErrorAction SilentlyContinue
            if ($logContent) {
                $errorPattern = "error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION|Cannot|cannot|not found|NotFound|Missing|missing|resolve dependencies|dependency|unhandled|Unhandled"
                $falsePositives = @("Found 0 errors", "No errors", "no errors found", "watching for file changes", "file changes", "compiled successfully", "successfully compiled")
                
                $allMatches = $logContent | Select-String -Pattern $errorPattern -CaseSensitive:$false
                if ($allMatches) {
                    # Filter out false positives
                    $errors = $allMatches | Where-Object { 
                        $line = $_.Line
                        $isFalsePositive = $false
                        foreach ($fp in $falsePositives) {
                            if ($line -match [regex]::Escape($fp)) {
                                $isFalsePositive = $true
                                break
                            }
                        }
                        -not $isFalsePositive
                    }
                    
                    if ($errors) {
                        $serviceErrors[$svc.Name] = $errors
                        Write-Host "    ⚠ $($svc.Name) has errors in log file ($($errors.Count) error(s))" -ForegroundColor Yellow
                    }
                }
            }
        }
    }
}

Write-Host ""

# Step 6: Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""

if ($allRunning) {
    Write-Host "  ✓ All services are running!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some services failed to start:" -ForegroundColor Yellow
    foreach ($service in $failedServices) {
        Write-Host "    - $service" -ForegroundColor Red
    }
}

# Show error summary if there were errors
if ($serviceErrors.Count -gt 0 -or $endpointErrors.Count -gt 0 -or $failedServices.Count -gt 0) {
    Write-Host ""
    Write-Host "=== Error Summary ===" -ForegroundColor Red
    Write-Host ""
    
    if ($failedServices.Count -gt 0) {
        Write-Host "  Services with port connection issues:" -ForegroundColor Yellow
        foreach ($service in $failedServices) {
            Write-Host "    ✗ $service" -ForegroundColor Red
            # Try to find corresponding log file
            $matchingSvc = $serviceDefinitions | Where-Object { $_.Name -like "*$service*" } | Select-Object -First 1
            if ($matchingSvc) {
                $logPath = Join-Path $PWD $matchingSvc.LogFile
                if (Test-Path $logPath) {
                    $errorPattern = "error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION|Cannot|cannot|not found|NotFound|Missing|missing|resolve dependencies|dependency|unhandled|Unhandled"
                    $falsePositives = @("Found 0 errors", "No errors", "no errors found", "watching for file changes", "file changes", "compiled successfully", "successfully compiled")
                    
                    $allMatches = Get-Content -Path $logPath -Tail 10 -ErrorAction SilentlyContinue | Where-Object { $_ -match $errorPattern }
                    $lastErrors = $allMatches | Where-Object { 
                        $line = $_
                        $isFalsePositive = $false
                        foreach ($fp in $falsePositives) {
                            if ($line -match [regex]::Escape($fp)) {
                                $isFalsePositive = $true
                                break
                            }
                        }
                        -not $isFalsePositive
                    }
                    if ($lastErrors) {
                        Write-Host "      Recent errors (last 10):" -ForegroundColor Gray
                        $lastErrors | ForEach-Object {
                            Write-Host "        $_" -ForegroundColor DarkYellow
                        }
                    }
                }
            }
        }
        Write-Host ""
    }
    
    if ($serviceErrors.Count -gt 0) {
        Write-Host "  Services with errors in logs:" -ForegroundColor Yellow
        foreach ($svcName in $serviceErrors.Keys) {
            Write-Host "    ⚠ $svcName" -ForegroundColor Yellow
            $matchingSvc = $serviceDefinitions | Where-Object { $_.Name -eq $svcName } | Select-Object -First 1
            if ($matchingSvc) {
                Write-Host "      Log: $($matchingSvc.LogFile)" -ForegroundColor Gray
            }
        }
        Write-Host ""
    }
    
    if ($endpointErrors.Count -gt 0) {
        Write-Host "  Services with HTTP endpoint issues:" -ForegroundColor Yellow
        foreach ($err in $endpointErrors) {
            Write-Host "    ✗ $err" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "  To investigate errors:" -ForegroundColor Cyan
    Write-Host "    1. Check the PowerShell windows for each service" -ForegroundColor White
    Write-Host "    2. View log files: Get-Content logs\<service-name>.log -Tail 50" -ForegroundColor White
    Write-Host "    3. Check service configuration and environment variables" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "  Service URLs:" -ForegroundColor Cyan
Write-Host "    - Web Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "    - API Gateway: http://localhost:3001/api" -ForegroundColor White
Write-Host "    - GraphQL: http://localhost:3001/graphql" -ForegroundColor White
Write-Host ""

Write-Host "  To stop all services:" -ForegroundColor Cyan
Write-Host "    pnpm kill:services" -ForegroundColor White
Write-Host "    OR close the PowerShell windows manually" -ForegroundColor White
Write-Host ""

Write-Host "=== Monitoring Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "  Services are running in separate PowerShell windows." -ForegroundColor Cyan
Write-Host "  Check each window for detailed logs, errors, and warnings." -ForegroundColor Cyan
Write-Host ""
Write-Host "  📁 Log Files Summary:" -ForegroundColor Cyan
Write-Host ""
$logFiles = Get-ChildItem -Path $logsDir -Filter "*.log" -ErrorAction SilentlyContinue
if ($logFiles) {
    Write-Host "    Found $($logFiles.Count) log file(s):" -ForegroundColor White
    foreach ($logFile in $logFiles) {
        $sizeKB = [math]::Round($logFile.Length / 1KB, 2)
        $lineCount = (Get-Content -Path $logFile.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        Write-Host "      • $($logFile.Name) - $sizeKB KB - $lineCount lines" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "    💡 All terminal output from each service is captured in these log files" -ForegroundColor Cyan
    Write-Host "       Each line includes a timestamp for easy tracking" -ForegroundColor Cyan
} else {
    Write-Host "    ⚠ No log files found yet. They will be created as services start." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Log files location: $logsDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📋 Quick Commands to View Logs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "    📄 View ALL output from a service (complete log):" -ForegroundColor White
Write-Host "      Get-Content logs\<service-name>.log" -ForegroundColor Gray
Write-Host ""
Write-Host "    📄 View last 100 lines of a service log:" -ForegroundColor White
Write-Host "      Get-Content logs\<service-name>.log -Tail 100" -ForegroundColor Gray
Write-Host ""
Write-Host "    🔍 View only errors from a service:" -ForegroundColor White
Write-Host "      Get-Content logs\<service-name>.log | Select-String -Pattern 'error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION' -CaseSensitive:`$false" -ForegroundColor Gray
Write-Host ""
Write-Host "    📊 View ALL logs from ALL services (complete output):" -ForegroundColor White
Write-Host "      Get-ChildItem logs\*.log | ForEach-Object { Write-Host \"`n`n========================================`n=== $($_.Name) ===`n========================================`n\"; Get-Content `$_.FullName }" -ForegroundColor Gray
Write-Host ""
Write-Host "    🔍 View all errors from all services:" -ForegroundColor White
Write-Host "      Get-ChildItem logs\*.log | ForEach-Object { Write-Host \"`n=== $($_.Name) ===\"; Get-Content `$_.FullName | Select-String -Pattern 'error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION' -CaseSensitive:`$false }" -ForegroundColor Gray
Write-Host ""
Write-Host "    📈 View log file sizes (to see which services are most active):" -ForegroundColor White
Write-Host "      Get-ChildItem logs\*.log | Select-Object Name, @{Name='Size(KB)';Expression={[math]::Round(`$_.Length/1KB,2)}}, LastWriteTime | Format-Table -AutoSize" -ForegroundColor Gray
Write-Host ""
Write-Host "    🔄 Run with all errors shown in summary:" -ForegroundColor White
Write-Host "      pnpm restart:all:all-errors" -ForegroundColor Gray
Write-Host ""
Write-Host "  💡 Note: ALL terminal output from each service is captured in the log files" -ForegroundColor Cyan
Write-Host "     Each log file contains everything written to the terminal, with timestamps" -ForegroundColor Cyan
Write-Host ""

