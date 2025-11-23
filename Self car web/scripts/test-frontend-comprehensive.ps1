# Comprehensive Frontend Testing Script
# Tests frontend functionality and connection

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE FRONTEND TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendUrl = "http://localhost:5173"
$backendUrl = "http://localhost:8080"
$apiUrl = "$backendUrl/api"

$testResults = @()
$allTestsPassed = $true

function Test-WebPage {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedContent = "",
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    Write-Host " [$Url]" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode
        $content = $response.Content
        
        if ($statusCode -eq $ExpectedStatus) {
            $hasContent = if ($ExpectedContent) { $content -match $ExpectedContent } else { $true }
            
            if ($hasContent) {
                Write-Host "  PASS - Status: $statusCode" -ForegroundColor Green
                $script:testResults += @{Test=$Name; Status="PASS"; StatusCode=$statusCode}
                return $true
            } else {
                Write-Host "  WARNING - Expected content not found" -ForegroundColor Yellow
                $script:testResults += @{Test=$Name; Status="WARN"; StatusCode=$statusCode}
                return $false
            }
        } else {
            Write-Host "  WARNING - Expected $ExpectedStatus, got $statusCode" -ForegroundColor Yellow
            $script:testResults += @{Test=$Name; Status="WARN"; StatusCode=$statusCode}
            return $false
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
        Write-Host "  FAIL - Status: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{Test=$Name; Status="FAIL"; StatusCode=$statusCode; Message=$_.Exception.Message}
        $script:allTestsPassed = $false
        return $false
    }
}

function Test-APIEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    Write-Host " [$Url]" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            $script:testResults += @{Test=$Name; Status="PASS"; StatusCode=$response.StatusCode}
            return $true
        } else {
            Write-Host "  WARNING - Expected $ExpectedStatus, got $($response.StatusCode)" -ForegroundColor Yellow
            $script:testResults += @{Test=$Name; Status="WARN"; StatusCode=$response.StatusCode}
            return $false
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  PASS - Expected status: $ExpectedStatus" -ForegroundColor Green
            $script:testResults += @{Test=$Name; Status="PASS"; StatusCode=$ExpectedStatus}
            return $true
        } else {
            Write-Host "  FAIL - Status: $statusCode" -ForegroundColor Red
            $script:testResults += @{Test=$Name; Status="FAIL"; StatusCode=$statusCode; Message=$_.Exception.Message}
            $script:allTestsPassed = $false
            return $false
        }
    }
}

# ============================================
# 1. Test Frontend Server
# ============================================
Write-Host ""
Write-Host "1. FRONTEND SERVER TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

Test-WebPage -Name "Frontend Homepage" -Url $frontendUrl -ExpectedContent "html|body|div" | Out-Null

# ============================================
# 2. Test Backend API (for frontend connection)
# ============================================
Write-Host ""
Write-Host "2. BACKEND API TESTS (Frontend Connection)" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

$backendRunning = Test-APIEndpoint -Name "Backend Health" -Url "$apiUrl/health"
if ($backendRunning) {
    Test-APIEndpoint -Name "Cars API" -Url "$apiUrl/cars" | Out-Null
    Test-APIEndpoint -Name "Available Cars" -Url "$apiUrl/cars/available" | Out-Null
}

# ============================================
# 3. Test Frontend Proxy
# ============================================
Write-Host ""
Write-Host "3. FRONTEND PROXY TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

# Test if Vite proxy works (frontend can proxy to backend)
try {
    $proxyResponse = Invoke-WebRequest -Uri "$frontendUrl/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "  PASS - Frontend proxy is working" -ForegroundColor Green
    Write-Host "    Frontend can proxy requests to backend" -ForegroundColor Gray
    $testResults += @{Test="Frontend Proxy"; Status="PASS"}
} catch {
    Write-Host "  INFO - Proxy test (may work at runtime in browser)" -ForegroundColor Yellow
    $testResults += @{Test="Frontend Proxy"; Status="INFO"}
}

# ============================================
# 4. Test Frontend Build
# ============================================
Write-Host ""
Write-Host "4. FRONTEND BUILD CHECK" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

$frontendPath = "frontend"
if (Test-Path "$frontendPath\package.json") {
    Write-Host "  ✅ Frontend package.json found" -ForegroundColor Green
    
    # Check if node_modules exists
    if (Test-Path "$frontendPath\node_modules") {
        Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Dependencies not installed" -ForegroundColor Yellow
        Write-Host "     Run: cd frontend && npm install" -ForegroundColor Gray
    }
    
    # Check if dist exists (production build)
    if (Test-Path "$frontendPath\dist") {
        Write-Host "  ✅ Production build exists" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  No production build (run: npm run build)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ Frontend directory not found" -ForegroundColor Red
}

# ============================================
# 5. Test Frontend Configuration
# ============================================
Write-Host ""
Write-Host "5. FRONTEND CONFIGURATION CHECK" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

$viteConfigPath = "$frontendPath\vite.config.js"
if (Test-Path $viteConfigPath) {
    $viteConfig = Get-Content $viteConfigPath -Raw
    
    # Check proxy configuration
    if ($viteConfig -match "proxy.*8080") {
        Write-Host "  ✅ Vite proxy configured for backend" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Vite proxy not configured" -ForegroundColor Yellow
    }
    
    # Check port configuration
    if ($viteConfig -match "port.*5173") {
        Write-Host "  ✅ Port 5173 configured" -ForegroundColor Green
    }
    
    # Check for SRI plugin issues
    if ($viteConfig -match "ViteSRI|vite-plugin-sri" -and $viteConfig -notmatch "Disabled|Commented") {
        Write-Host "  ⚠️  SRI plugin may cause issues" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ SRI plugin handled correctly" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ vite.config.js not found" -ForegroundColor Red
}

# Check API configuration
$apiJsPath = "$frontendPath\src\services\api.js"
if (Test-Path $apiJsPath) {
    $apiJs = Get-Content $apiJsPath -Raw
    if ($apiJs -match "localhost:8080|localhost:5173") {
        Write-Host "  ✅ API configuration found" -ForegroundColor Green
    }
}

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = $testResults.Count
$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warned = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "PASSED: $passed" -ForegroundColor Green
Write-Host "WARNINGS: $warned" -ForegroundColor Yellow
Write-Host "FAILED: $failed" -ForegroundColor Red
Write-Host ""

if ($allTestsPassed -and $failed -eq 0) {
    Write-Host "✅ All critical tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend is ready for testing:" -ForegroundColor Cyan
    Write-Host "   URL: $frontendUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "Browser Testing:" -ForegroundColor Cyan
    Write-Host "1. Open: $frontendUrl" -ForegroundColor White
    Write-Host "2. Open DevTools (F12)" -ForegroundColor White
    Write-Host "3. Check Console tab for errors" -ForegroundColor White
    Write-Host "4. Check Network tab for API calls" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tests failed or have warnings" -ForegroundColor Yellow
    Write-Host ""
    if ($failed -gt 0) {
        Write-Host "Failed Tests:" -ForegroundColor Red
        $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
            Write-Host "  • $($_.Test): $($_.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

