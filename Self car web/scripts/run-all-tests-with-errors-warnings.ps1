# Comprehensive Test Runner - Captures All Errors and Warnings
# This script runs all tests and systematically captures all errors and warnings
#
# Usage:
#   .\scripts\run-all-tests-with-errors-warnings.ps1
#   .\scripts\run-all-tests-with-errors-warnings.ps1 -SkipBackend
#   .\scripts\run-all-tests-with-errors-warnings.ps1 -SkipE2E
#   .\scripts\run-all-tests-with-errors-warnings.ps1 -NoSaveToFile
#
# What it does:
#   1. Runs Backend tests (Maven)
#   2. Runs Frontend unit tests (Vitest)
#   3. Runs Frontend E2E tests (Playwright)
#   4. Runs Linter checks
#   5. Captures ALL errors from all test outputs
#   6. Captures ALL warnings from all test outputs
#   7. Generates separate error and warning reports
#   8. Saves all reports to test-results/ directory

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipE2E,
    [switch]$NoSaveToFile
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE TEST RUNNER - ERROR & WARNING CAPTURE" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root (parent of scripts directory)
$scriptPath = $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($scriptPath)) {
    $scriptPath = $PSCommandPath
}
if ([string]::IsNullOrWhiteSpace($scriptPath)) {
    $scriptPath = Join-Path $PSScriptRoot "run-all-tests-with-errors-warnings.ps1"
}

$scriptDir = Split-Path -Parent $scriptPath
$projectRoot = Split-Path -Parent $scriptDir

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outputDir = Join-Path $projectRoot "test-results"
$errorsFile = Join-Path $outputDir "errors_$timestamp.txt"
$warningsFile = Join-Path $outputDir "warnings_$timestamp.txt"
$summaryFile = Join-Path $outputDir "test_summary_$timestamp.txt"

# Create output directory
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Initialize collections
$allErrors = @()
$allWarnings = @()
$testResults = @{
    Backend = @{ Status = "NOT_RUN"; Errors = @(); Warnings = @() }
    Frontend = @{ Status = "NOT_RUN"; Errors = @(); Warnings = @() }
    FrontendE2E = @{ Status = "NOT_RUN"; Errors = @(); Warnings = @() }
    Linter = @{ Status = "NOT_RUN"; Errors = @(); Warnings = @() }
}

function Capture-Errors-Warnings {
    param(
        [string]$Output,
        [string]$TestType
    )
    
    if ([string]::IsNullOrWhiteSpace($Output)) { return }
    
    $lines = $Output -split "`r?`n"
    $currentError = @()
    $inErrorBlock = $false
    $inWarningBlock = $false
    $currentWarning = @()
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        # removed unused lower-cased line variable
        
        # Enhanced error patterns
        $isError = $false
        $isWarning = $false
        
        # Check for error patterns
        if ($line -match "ERROR|Error:|FAILED|Failed:|FAIL|Exception|AssertionError|Assertion|Test failed|Test Error|SyntaxError|ReferenceError|TypeError|RangeError|✖|×|FAIL \d+|FAILED \d+|error TS\d+|error \d+|Error \d+|FATAL|Fatal|❌") {
            $isError = $true
            $inErrorBlock = $true
            $inWarningBlock = $false
        }
        
        # Check for warning patterns
        if ($line -match "WARN|Warning:|WARNING|deprecated|Deprecated|DEPRECATED|unused|Unused|Missing|missing|not found|Not found|⚠|Warning \d+|warning:|⚠️|console\.warn|console\.error") {
            $isWarning = $true
            $inWarningBlock = $true
        }
        
        # Maven-specific patterns
        if ($line -match "Tests run:.*Failures:.*Errors:") {
            $mavenMatch = [regex]::Match($line, "Failures: (\d+).*Errors: (\d+)")
            if ($mavenMatch.Success) {
                $failures = [int]$mavenMatch.Groups[1].Value
                $errors = [int]$mavenMatch.Groups[2].Value
                if ($failures -gt 0 -or $errors -gt 0) {
                    $isError = $true
                }
            }
        }
        
        # Vitest-specific patterns
        if ($line -match "FAIL|FAILED|FAIL \d+|Test Files.*failed|Tests.*failed") {
            $isError = $true
        }
        
        # ESLint patterns
        if ($line -match "error\s+\d+|warning\s+\d+") {
            if ($line -match "error") {
                $isError = $true
            } elseif ($line -match "warning") {
                $isWarning = $true
            }
        }
        
        # Stack trace detection - continue error block
        if ($inErrorBlock -and ($line -match "at |Stack:|stack|^\s+at\s|^\s+at\w+|Caused by|Trace:")) {
            $isError = $true
        }
        
        # Test failure details
        if ($inErrorBlock -and ($line -match "Expected:|Received:|Actual:|Expected to|but got|Assertion|expect|assert|should")) {
            $isError = $true
        }
        
        # Capture error
        if ($isError) {
            $currentError += $line
            $inErrorBlock = $true
            $inWarningBlock = $false
            
            # If next line doesn't look like continuation, save current error
            if ($i -lt $lines.Length - 1) {
                $nextLine = $lines[$i + 1]
                if ($nextLine -notmatch "^\s|at |Stack:|Caused by|Expected:|Received:|Actual:|Trace:" -and 
                    $nextLine -notmatch "error|Error|FAIL|Exception|Assertion" -and
                    [string]::IsNullOrWhiteSpace($nextLine)) {
                    if ($currentError.Count -gt 0) {
                        $errorText = ($currentError -join "`n").Trim()
                        if (-not [string]::IsNullOrWhiteSpace($errorText)) {
                            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            $errorEntry1 = [PSCustomObject]@{
                                TestType = $TestType
                                Line = $errorText
                                Timestamp = $timestamp
                            }
                            $errorEntry2 = [PSCustomObject]@{
                                TestType = $TestType
                                Line = $errorText
                                Timestamp = $timestamp
                            }
                            $allErrors = $allErrors + $errorEntry1
                            $testResults[$TestType].Errors = $testResults[$TestType].Errors + $errorEntry2
                        }
                        $currentError = @()
                        $inErrorBlock = $false
                    }
                }
            }
        } else {
            if ($inErrorBlock) {
                # Continue error block for multi-line errors
                if ($line -match "^\s|at |Stack:|Caused by|Expected:|Received:|Actual:|Trace:" -or 
                    [string]::IsNullOrWhiteSpace($line)) {
                    $currentError += $line
                } else {
                    # End of error block
                    if ($currentError.Count -gt 0) {
                        $errorText = ($currentError -join "`n").Trim()
                        if (-not [string]::IsNullOrWhiteSpace($errorText)) {
                            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            $errorEntry1 = [PSCustomObject]@{
                                TestType = $TestType
                                Line = $errorText
                                Timestamp = $timestamp
                            }
                            $errorEntry2 = [PSCustomObject]@{
                                TestType = $TestType
                                Line = $errorText
                                Timestamp = $timestamp
                            }
                            $allErrors = $allErrors + $errorEntry1
                            $testResults[$TestType].Errors = $testResults[$TestType].Errors + $errorEntry2
                        }
                        $currentError = @()
                        $inErrorBlock = $false
                    }
                }
            }
        }
        
        # Capture warning
        if ($isWarning -and -not $inErrorBlock) {
            $currentWarning += $line
            $inWarningBlock = $true
            
            # Save warning if next line doesn't continue
            if ($i -eq $lines.Length - 1 -or 
                ($i -lt $lines.Length - 1 -and 
                 $lines[$i + 1] -notmatch "warning|Warning|deprecated|unused|missing" -and
                 -not [string]::IsNullOrWhiteSpace($lines[$i + 1]))) {
                if ($currentWarning.Count -gt 0) {
                    $warningText = ($currentWarning -join "`n").Trim()
                    if (-not [string]::IsNullOrWhiteSpace($warningText)) {
                        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        $warningEntry1 = [PSCustomObject]@{
                            TestType = $TestType
                            Line = $warningText
                            Timestamp = $timestamp
                        }
                        $warningEntry2 = [PSCustomObject]@{
                            TestType = $TestType
                            Line = $warningText
                            Timestamp = $timestamp
                        }
                        $allWarnings = $allWarnings + $warningEntry1
                        $testResults[$TestType].Warnings = $testResults[$TestType].Warnings + $warningEntry2
                    }
                    $currentWarning = @()
                    $inWarningBlock = $false
                }
            }
        }
    }
    
    # Save any remaining errors/warnings
    if ($currentError.Count -gt 0) {
        $errorText = ($currentError -join "`n").Trim()
        if (-not [string]::IsNullOrWhiteSpace($errorText)) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $errorEntry1 = [PSCustomObject]@{
                TestType = $TestType
                Line = $errorText
                Timestamp = $timestamp
            }
            $errorEntry2 = [PSCustomObject]@{
                TestType = $TestType
                Line = $errorText
                Timestamp = $timestamp
            }
            $allErrors = $allErrors + $errorEntry1
            $testResults[$TestType].Errors = $testResults[$TestType].Errors + $errorEntry2
        }
    }
    
    if ($currentWarning.Count -gt 0) {
        $warningText = ($currentWarning -join "`n").Trim()
        if (-not [string]::IsNullOrWhiteSpace($warningText)) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $warningEntry1 = [PSCustomObject]@{
                TestType = $TestType
                Line = $warningText
                Timestamp = $timestamp
            }
            $warningEntry2 = [PSCustomObject]@{
                TestType = $TestType
                Line = $warningText
                Timestamp = $timestamp
            }
            $allWarnings = $allWarnings + $warningEntry1
            $testResults[$TestType].Warnings = $testResults[$TestType].Warnings + $warningEntry2
        }
    }
}

# ============================================
# 1. Backend Tests (Maven)
# ============================================
if (-not $SkipBackend) {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "  1. RUNNING BACKEND TESTS (Maven)" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host ""
    
    $backendOutput = ""
    
    try {
        Push-Location backend
        
        $backendOutputFile = Join-Path $outputDir "backend_output_$timestamp.txt"
        $backendOutput = & mvn test 2>&1 | Out-String
        $backendOutput | Out-File -FilePath $backendOutputFile -Encoding UTF8
        
        $backendExitCode = $LASTEXITCODE
        if ($backendExitCode -eq 0) {
            Write-Host "  [PASS] Backend tests completed" -ForegroundColor Green
            $testResults.Backend.Status = "PASSED"
        } else {
            Write-Host "  [FAIL] Backend tests failed (Exit Code: $backendExitCode)" -ForegroundColor Red
            $testResults.Backend.Status = "FAILED"
        }
        
        Capture-Errors-Warnings -Output $backendOutput -TestType "Backend"
        
        # Parse Maven test summary
        $mavenSummaryMatch = [regex]::Match($backendOutput, "Tests run: (\d+), Failures: (\d+), Errors: (\d+)")
        if ($mavenSummaryMatch.Success) {
            $totalTests = $mavenSummaryMatch.Groups[1].Value
            $failures = [int]$mavenSummaryMatch.Groups[2].Value
            $errors = [int]$mavenSummaryMatch.Groups[3].Value
            if ($failures -gt 0 -or $errors -gt 0) {
                $testResults.Backend.Status = "FAILED"
                Write-Host "  Tests: $totalTests, Failures: $failures, Errors: $errors" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "  [ERROR] Error running backend tests: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Backend.Status = "ERROR"
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $errorMsg = "Exception: $($_.Exception.Message)`n$($_.Exception.StackTrace)"
        $allErrors += [PSCustomObject]@{
            TestType = "Backend"
            Line = $errorMsg
            Timestamp = $timestamp
        }
        $testResults.Backend.Errors = $testResults.Backend.Errors + [PSCustomObject]@{
            TestType = "Backend"
            Line = $errorMsg
            Timestamp = $timestamp
        }
    } finally {
        Pop-Location
    }
}

# ============================================
# 2. Frontend Unit Tests (Vitest)
# ============================================
if (-not $SkipFrontend) {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "  2. RUNNING FRONTEND UNIT TESTS (Vitest)" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host ""
    
    $frontendOutput = ""
    
    try {
        Push-Location frontend
        
        $frontendOutputFile = Join-Path $outputDir "frontend_output_$timestamp.txt"
        $frontendOutput = & npm run test:run 2>&1 | Out-String
        $frontendOutput | Out-File -FilePath $frontendOutputFile -Encoding UTF8
        
        $frontendExitCode = $LASTEXITCODE
        if ($frontendExitCode -eq 0) {
            Write-Host "  [PASS] Frontend unit tests completed" -ForegroundColor Green
            $testResults.Frontend.Status = "PASSED"
        } else {
            Write-Host "  [FAIL] Frontend unit tests failed (Exit Code: $frontendExitCode)" -ForegroundColor Red
            $testResults.Frontend.Status = "FAILED"
        }
        
        Capture-Errors-Warnings -Output $frontendOutput -TestType "Frontend"
        
        # Parse Vitest summary
        if ($frontendOutput -match "Test Files\s+(\d+)\s+failed|Tests\s+(\d+)\s+failed") {
            $testResults.Frontend.Status = "FAILED"
        }
        
    } catch {
        Write-Host "  [ERROR] Error running frontend tests: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Frontend.Status = "ERROR"
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $errorMsg = "Exception: $($_.Exception.Message)`n$($_.Exception.StackTrace)"
        $allErrors += [PSCustomObject]@{
            TestType = "Frontend"
            Line = $errorMsg
            Timestamp = $timestamp
        }
        $testResults.Frontend.Errors = $testResults.Frontend.Errors + [PSCustomObject]@{
            TestType = "Frontend"
            Line = $errorMsg
            Timestamp = $timestamp
        }
    } finally {
        Pop-Location
    }
}

# ============================================
# 3. Frontend E2E Tests (Playwright)
# ============================================
if (-not $SkipE2E) {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "  3. RUNNING FRONTEND E2E TESTS (Playwright)" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host ""
    
    $e2eOutput = ""
    
    try {
        Push-Location frontend
        
        $e2eOutputFile = Join-Path $outputDir "e2e_output_$timestamp.txt"
        $e2eOutput = & npm run test:e2e 2>&1 | Out-String
        $e2eOutput | Out-File -FilePath $e2eOutputFile -Encoding UTF8
        
        $e2eExitCode = $LASTEXITCODE
        if ($e2eExitCode -eq 0) {
            Write-Host "  [PASS] Frontend E2E tests completed" -ForegroundColor Green
            $testResults.FrontendE2E.Status = "PASSED"
        } else {
            Write-Host "  [FAIL] Frontend E2E tests failed (Exit Code: $e2eExitCode)" -ForegroundColor Red
            $testResults.FrontendE2E.Status = "FAILED"
        }
        
        Capture-Errors-Warnings -Output $e2eOutput -TestType "FrontendE2E"
        
    } catch {
        Write-Host "  [ERROR] Error running E2E tests: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.FrontendE2E.Status = "ERROR"
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $errorMsg = "Exception: $($_.Exception.Message)`n$($_.Exception.StackTrace)"
        $allErrors += [PSCustomObject]@{
            TestType = "FrontendE2E"
            Line = $errorMsg
            Timestamp = $timestamp
        }
        $testResults.FrontendE2E.Errors = $testResults.FrontendE2E.Errors + [PSCustomObject]@{
            TestType = "FrontendE2E"
            Line = $errorMsg
            Timestamp = $timestamp
        }
    } finally {
        Pop-Location
    }
}

# ============================================
# 4. Linter Checks
# ============================================
Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "  4. RUNNING LINTER CHECKS" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    Push-Location frontend
    
    $lintOutputFile = Join-Path $outputDir "lint_output_$timestamp.txt"
    $lintOutput = & npm run lint 2>&1 | Out-String
    $lintOutput | Out-File -FilePath $lintOutputFile -Encoding UTF8
    
    $lintExitCode = $LASTEXITCODE
    if ($lintExitCode -eq 0) {
        Write-Host "  [PASS] Linter checks passed" -ForegroundColor Green
        $testResults.Linter.Status = "PASSED"
    } else {
        Write-Host "  [FAIL] Linter checks failed (Exit Code: $lintExitCode)" -ForegroundColor Red
        $testResults.Linter.Status = "FAILED"
    }
    
    Capture-Errors-Warnings -Output $lintOutput -TestType "Linter"
    
} catch {
    Write-Host "  [ERROR] Error running linter: $($_.Exception.Message)" -ForegroundColor Red
    $testResults.Linter.Status = "ERROR"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $errorMsg = "Exception: $($_.Exception.Message)`n$($_.Exception.StackTrace)"
    $allErrors = $allErrors + [PSCustomObject]@{
        TestType = "Linter"
        Line = $errorMsg
        Timestamp = $timestamp
    }
    $testResults.Linter.Errors = $testResults.Linter.Errors + [PSCustomObject]@{
        TestType = "Linter"
        Line = $errorMsg
        Timestamp = $timestamp
    }
} finally {
    Pop-Location
}

# ============================================
# Aggregate all errors and warnings from testResults (de-duplicate by content)
# ============================================
$errorSeen = @{}
$warningSeen = @{}

foreach ($testType in $testResults.Keys) {
    $result = $testResults[$testType]
    foreach ($error in $result.Errors) {
        if ($null -ne $error -and $null -ne $error.Line) {
            $key = "$($error.TestType)|$([string]$error.Line)"
            if (-not $errorSeen.ContainsKey($key)) {
                $errorSeen[$key] = $true
                $allErrors = $allErrors + $error
            }
        }
    }
    foreach ($warning in $result.Warnings) {
        if ($null -ne $warning -and $null -ne $warning.Line) {
            $key = "$($warning.TestType)|$([string]$warning.Line)"
            if (-not $warningSeen.ContainsKey($key)) {
                $warningSeen[$key] = $true
                $allWarnings = $allWarnings + $warning
            }
        }
    }
}

# ============================================
# Generate Error Report
# ============================================
Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Red
Write-Host "  ALL ERRORS CAPTURED" -ForegroundColor Red
Write-Host "-----------------------------------------------------------------" -ForegroundColor Red
Write-Host ""

if ($allErrors.Count -eq 0) {
    Write-Host "  [OK] No errors found!" -ForegroundColor Green
    "No errors found during test execution." | Out-File -FilePath $errorsFile -Encoding UTF8
} else {
    Write-Host "  [ERROR] Found $($allErrors.Count) error(s)" -ForegroundColor Red
    Write-Host ""
    
    $errorReport = @"
=================================================================
TEST ERRORS REPORT
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Total Errors: $($allErrors.Count)
=================================================================

"@
    
    # Group errors by test type
    $errorsByType = $allErrors | Group-Object -Property TestType
    
    foreach ($group in $errorsByType) {
        $errorReport += "`n[$($group.Name)] - $($group.Count) error(s)`n"
        $errorReport += ("=" * 70) + "`n`n"
        
        $errorNum = 1
        foreach ($errItem in $group.Group) {
            $errorReport += "ERROR #$errorNum`n"
            $errorReport += "-" * 70 + "`n"
            $errorReport += "[$($errItem.Timestamp)]`n"
            $errorReport += "$($errItem.Line)`n"
            $errorReport += "`n"
            $errorNum++
        }
        
        $errorReport += "`n"
    }
    
    # Display ALL errors in console
    foreach ($group in $errorsByType) {
        Write-Host "  [$($group.Name)] - $($group.Count) error(s)" -ForegroundColor Yellow
        $errorNum = 1
        foreach ($errItem in $group.Group) {
            Write-Host "    ERROR #$errorNum :" -ForegroundColor Red
            $errorLines = $errItem.Line -split "`n"
            foreach ($errorLine in $errorLines) {
                if ($errorLine.Length -gt 150) {
                    Write-Host "      $($errorLine.Substring(0, 150))..." -ForegroundColor Red
                } else {
                    Write-Host "      $errorLine" -ForegroundColor Red
                }
            }
            Write-Host ""
            $errorNum++
        }
        Write-Host ""
    }
    
    if (-not $NoSaveToFile) {
        $errorReport | Out-File -FilePath $errorsFile -Encoding UTF8
        Write-Host "  [FILE] Full error report saved to: $errorsFile" -ForegroundColor Cyan
    }
}

# ============================================
# Generate Warning Report
# ============================================
Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "  ALL WARNINGS CAPTURED" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

if ($allWarnings.Count -eq 0) {
    Write-Host "  [OK] No warnings found!" -ForegroundColor Green
    "No warnings found during test execution." | Out-File -FilePath $warningsFile -Encoding UTF8
} else {
    Write-Host "  [WARNING] Found $($allWarnings.Count) warning(s)" -ForegroundColor Yellow
    Write-Host ""
    
    $warningReport = @"
=================================================================
TEST WARNINGS REPORT
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Total Warnings: $($allWarnings.Count)
=================================================================

"@
    
    # Group warnings by test type
    $warningsByType = $allWarnings | Group-Object -Property TestType
    
    foreach ($group in $warningsByType) {
        $warningReport += "`n[$($group.Name)] - $($group.Count) warning(s)`n"
        $warningReport += ("=" * 70) + "`n`n"
        
        $warningNum = 1
        foreach ($warnItem in $group.Group) {
            $warningReport += "WARNING #$warningNum`n"
            $warningReport += "-" * 70 + "`n"
            $warningReport += "[$($warnItem.Timestamp)]`n"
            $warningReport += "$($warnItem.Line)`n"
            $warningReport += "`n"
            $warningNum++
        }
        
        $warningReport += "`n"
    }
    
    # Display ALL warnings in console
    foreach ($group in $warningsByType) {
        Write-Host "  [$($group.Name)] - $($group.Count) warning(s)" -ForegroundColor Yellow
        $warningNum = 1
        foreach ($warnItem in $group.Group) {
            Write-Host "    WARNING #$warningNum :" -ForegroundColor Yellow
            $warningLines = $warnItem.Line -split "`n"
            foreach ($warningLine in $warningLines) {
                if ($warningLine.Length -gt 150) {
                    Write-Host "      $($warningLine.Substring(0, 150))..." -ForegroundColor Yellow
                } else {
                    Write-Host "      $warningLine" -ForegroundColor Yellow
                }
            }
            Write-Host ""
            $warningNum++
        }
        Write-Host ""
    }
    
    if (-not $NoSaveToFile) {
        $warningReport | Out-File -FilePath $warningsFile -Encoding UTF8
        Write-Host "  [FILE] Full warning report saved to: $warningsFile" -ForegroundColor Cyan
    }
}

# ============================================
# Generate Summary Report
# ============================================
Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

$summaryReport = @"
=================================================================
TEST EXECUTION SUMMARY
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
=================================================================

TEST RESULTS:
"@

foreach ($testType in $testResults.Keys) {
    $result = $testResults[$testType]
    $statusIcon = switch ($result.Status) {
        "PASSED" { "[PASS]" }
        "FAILED" { "[FAIL]" }
        "ERROR" { "[ERROR]" }
        default { "[SKIP]" }
    }
    
    Write-Host "  $statusIcon [$testType] - $($result.Status)" -ForegroundColor $(switch ($result.Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "ERROR" { "Red" }
        default { "Gray" }
    })
    Write-Host "      Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -ForegroundColor Gray
    
    $summaryReport += "`n[$testType]`n"
    $summaryReport += "  Status: $($result.Status)`n"
    $summaryReport += "  Errors: $($result.Errors.Count)`n"
    $summaryReport += "  Warnings: $($result.Warnings.Count)`n"
}

$summaryReport += "`n`n=================================================================`n"
$summaryReport += "OVERALL STATISTICS`n"
$summaryReport += "=================================================================`n"
$summaryReport += "Total Errors: $($allErrors.Count)`n"
$summaryReport += "Total Warnings: $($allWarnings.Count)`n"
$summaryReport += "`nFiles Generated:`n"
$summaryReport += "  - Errors: $errorsFile`n"
$summaryReport += "  - Warnings: $warningsFile`n"
$summaryReport += "  - Summary: $summaryFile`n"

if (-not $NoSaveToFile) {
    $summaryReport | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-Host ""
    Write-Host "  [FILE] Summary report saved to: $summaryFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [DIR] All reports saved to: $outputDir" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Test execution completed!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Exit with appropriate code
$hasFailures = ($testResults.Values | Where-Object { 
    $status = $_.Status
    $status -eq 'FAILED' -or $status -eq 'ERROR'
}).Count -gt 0

if ($hasFailures) {
    exit 1
} else {
    exit 0
}
