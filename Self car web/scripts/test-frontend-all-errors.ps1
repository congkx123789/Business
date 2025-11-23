# Comprehensive Frontend Test - Captures ALL Errors and Warnings
# This script runs the frontend and captures everything

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FRONTEND COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "Captures ALL Errors and Warnings" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"
$testDuration = 30  # seconds to run the test
$errorList = @()
$warningList = @()
$output = @()

# Get absolute path
$frontendFullPath = (Resolve-Path $frontendPath).Path

Write-Host "Starting frontend server and capturing output..." -ForegroundColor Yellow
Write-Host "Test duration: $testDuration seconds" -ForegroundColor Gray
Write-Host "Frontend path: $frontendFullPath" -ForegroundColor Gray
Write-Host ""

# Start npm run dev in background and capture output
$job = Start-Job -ScriptBlock {
    Set-Location $using:frontendFullPath
    npm run dev 2>&1
}

# Wait and collect output
$startTime = Get-Date
$timeout = $startTime.AddSeconds($testDuration)

Write-Host "Collecting output..." -ForegroundColor Cyan
Write-Host ""

while ((Get-Date) -lt $timeout) {
    $jobOutput = Receive-Job $job -ErrorAction SilentlyContinue
    if ($jobOutput) {
        foreach ($line in $jobOutput) {
            $output += $line
            Write-Host $line -ForegroundColor Gray
            
            # Categorize errors
            if ($line -match "error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION") {
                if ($line -notmatch "warning|Warning|WARNING") {
                    $script:errorList += $line
                }
            }
            
            # Categorize warnings
            if ($line -match "warning|Warning|WARNING|deprecated|Deprecated|DEPRECATED|deprecation|Deprecation") {
                $script:warningList += $line
            }
        }
    }
    Start-Sleep -Milliseconds 500
}

# Stop the job
Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANALYSIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Count different types
$errorCount = $errorList.Count
$warningCount = $warningList.Count
$totalLines = $output.Count

Write-Host "Total output lines: $totalLines" -ForegroundColor White
Write-Host "Errors found: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings found: $warningCount" -ForegroundColor $(if ($warningCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# Show all errors
if ($errorCount -gt 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ALL ERRORS ($errorCount)" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    $errorIndex = 1
    foreach ($err in $errorList) {
        Write-Host "[ERROR $errorIndex]" -ForegroundColor Red
        Write-Host $err -ForegroundColor Red
        Write-Host ""
        $errorIndex++
    }
} else {
    Write-Host "✅ No errors found!" -ForegroundColor Green
    Write-Host ""
}

# Show all warnings
if ($warningCount -gt 0) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "ALL WARNINGS ($warningCount)" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    $warningIndex = 1
    foreach ($warn in $warningList) {
        Write-Host "[WARNING $warningIndex]" -ForegroundColor Yellow
        Write-Host $warn -ForegroundColor Yellow
        Write-Host ""
        $warningIndex++
    }
} else {
    Write-Host "✅ No warnings found!" -ForegroundColor Green
    Write-Host ""
}

# Check for specific common errors
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SPECIFIC ERROR CHECKS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$specificErrors = @{
    "ViteSRI Error" = $output | Where-Object { $_ -match "ViteSRI|vite-plugin-sri" }
    "Import Error" = $output | Where-Object { $_ -match "Cannot find module|does not provide an export" }
    "Syntax Error" = $output | Where-Object { $_ -match "SyntaxError|Parse error" }
    "Connection Error" = $output | Where-Object { $_ -match "ECONNREFUSED|Connection refused|failed to connect" }
    "Port Error" = $output | Where-Object { $_ -match "port.*in use|EADDRINUSE" }
    "Build Error" = $output | Where-Object { $_ -match "Build failed|build error|compilation failed" }
}

foreach ($check in $specificErrors.GetEnumerator()) {
    if ($check.Value) {
        Write-Host "❌ $($check.Key): FOUND" -ForegroundColor Red
        $check.Value | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "✅ $($check.Key): None" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS INDICATORS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$successIndicators = @{
    "Vite Started" = $output | Where-Object { $_ -match "ready|Local.*5173|VITE.*ready" }
    "Server Running" = $output | Where-Object { $_ -match "Local:.*http|Network:" }
    "No Fatal Errors" = -not ($output | Where-Object { $_ -match "fatal|FATAL|crash|Crash" })
}

foreach ($indicator in $successIndicators.GetEnumerator()) {
    if ($indicator.Value) {
        Write-Host "✅ $($indicator.Key)" -ForegroundColor Green
        if ($indicator.Value.Count -gt 0) {
            $indicator.Value | Select-Object -First 1 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    } else {
        Write-Host "❌ $($indicator.Key)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FULL OUTPUT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Showing all captured output:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

$outputIndex = 1
foreach ($line in $output) {
    $color = "White"
    if ($line -match "error|Error|ERROR|failed|Failed") {
        $color = "Red"
    } elseif ($line -match "warning|Warning|WARNING") {
        $color = "Yellow"
    } elseif ($line -match "ready|Local|VITE") {
        $color = "Green"
    }
    Write-Host "[$outputIndex] " -NoNewline -ForegroundColor Gray
    Write-Host $line -ForegroundColor $color
    $outputIndex++
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errorCount -eq 0 -and ($successIndicators["Vite Started"])) {
    Write-Host "✅ SUCCESS: Frontend is running without critical errors!" -ForegroundColor Green
    Write-Host "   URL: http://localhost:5173" -ForegroundColor Cyan
} elseif ($errorCount -gt 0) {
    Write-Host "❌ FAILED: Found $errorCount error(s)" -ForegroundColor Red
    Write-Host "   Review errors above" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  WARNING: Server may not have started properly" -ForegroundColor Yellow
}

if ($warningCount -gt 0) {
    Write-Host "⚠️  Found $warningCount warning(s) - review above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test completed at: $(Get-Date)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errorCount -gt 0) {
    Write-Host "To fix errors:" -ForegroundColor Yellow
    Write-Host "1. Check if frontend directory exists" -ForegroundColor White
    Write-Host "2. Verify package.json exists in frontend folder" -ForegroundColor White
    Write-Host "3. Run: cd frontend && npm install" -ForegroundColor White
    Write-Host "4. Check for missing dependencies" -ForegroundColor White
} else {
    Write-Host "✅ Frontend appears to be running correctly!" -ForegroundColor Green
}

Write-Host ""

