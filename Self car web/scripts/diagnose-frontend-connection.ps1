# Diagnose Frontend Connection Errors
# Checks common connection issues between frontend and backend

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FRONTEND CONNECTION ERROR DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:8080"
$frontendUrl = "http://localhost:5173"
$apiUrl = "$backendUrl/api"

$issues = @()
$warnings = @()

# ============================================
# 1. Check Server Status
# ============================================
Write-Host "1. CHECKING SERVER STATUS" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

$backendRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "  ❌ Backend is NOT running" -ForegroundColor Red
    $issues += "Backend server is not running at $backendUrl"
}

try {
    $response = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✅ Frontend is running" -ForegroundColor Green
    $frontendRunning = $true
} catch {
    Write-Host "  ❌ Frontend is NOT running" -ForegroundColor Red
    $issues += "Frontend server is not running at $frontendUrl"
}

# ============================================
# 2. Check CORS Configuration
# ============================================
Write-Host ""
Write-Host "2. CHECKING CORS CONFIGURATION" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

if ($backendRunning) {
    try {
        # Test OPTIONS request (CORS preflight)
        $headers = @{
            "Origin" = $frontendUrl
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Content-Type,Authorization"
        }
        
        $corsResponse = Invoke-WebRequest -Uri "$apiUrl/cars" -Method "OPTIONS" -Headers $headers -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        $allowOrigin = $corsResponse.Headers["Access-Control-Allow-Origin"]
        $allowMethods = $corsResponse.Headers["Access-Control-Allow-Methods"]
        $allowHeaders = $corsResponse.Headers["Access-Control-Allow-Headers"]
        
        Write-Host "  CORS Headers:" -ForegroundColor Cyan
        Write-Host "    Allow-Origin: $allowOrigin" -ForegroundColor Gray
        Write-Host "    Allow-Methods: $allowMethods" -ForegroundColor Gray
        Write-Host "    Allow-Headers: $allowHeaders" -ForegroundColor Gray
        
        if ($allowOrigin -eq "*" -or $allowOrigin -eq $frontendUrl) {
            Write-Host "  ✅ CORS is properly configured" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  CORS may not allow frontend origin" -ForegroundColor Yellow
            $warnings += "CORS Allow-Origin is: $allowOrigin, expected: $frontendUrl"
        }
    } catch {
        Write-Host "  ⚠️  CORS preflight test failed (may use proxy instead)" -ForegroundColor Yellow
        $warnings += "CORS preflight failed: $($_.Exception.Message)"
    }
    
    # Test actual GET request with Origin header
    try {
        $headers = @{
            "Origin" = $frontendUrl
        }
        $testResponse = Invoke-WebRequest -Uri "$apiUrl/cars" -Headers $headers -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✅ GET request with Origin header successful" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "  ❌ CORS blocked the request (403)" -ForegroundColor Red
            $issues += "CORS is blocking requests from frontend"
        } else {
            Write-Host "  ⚠️  Request failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# ============================================
# 3. Check API Endpoints
# ============================================
Write-Host ""
Write-Host "3. CHECKING API ENDPOINTS" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

if ($backendRunning) {
    $endpoints = @(
        @{ Name = "Health"; Url = "$apiUrl/health" },
        @{ Name = "Cars"; Url = "$apiUrl/cars" },
        @{ Name = "Auth Health"; Url = "$apiUrl/auth/me" }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $headers = @{ "Origin" = $frontendUrl }
            $response = Invoke-WebRequest -Uri $endpoint.Url -Headers $headers -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
                Write-Host "  ✅ $($endpoint.Name): Status $($response.StatusCode)" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  $($endpoint.Name): Status $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
            if ($statusCode -eq 401) {
                Write-Host "  ✅ $($endpoint.Name): Requires auth (401) - OK" -ForegroundColor Green
            } else {
                Write-Host "  ❌ $($endpoint.Name): Failed - $($_.Exception.Message)" -ForegroundColor Red
                $issues += "$($endpoint.Name) endpoint failed: $($_.Exception.Message)"
            }
        }
    }
}

# ============================================
# 4. Check Frontend Configuration
# ============================================
Write-Host ""
Write-Host "4. CHECKING FRONTEND CONFIGURATION" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

$apiJsPath = "frontend\src\services\api.js"
if (Test-Path $apiJsPath) {
    $apiJsContent = Get-Content $apiJsPath -Raw
    if ($apiJsContent -match "API_BASE_URL.*=.*['`"]([^'`"]+)['`"]") {
        $configuredUrl = $matches[1]
        Write-Host "  API Base URL configured: $configuredUrl" -ForegroundColor Gray
        if ($configuredUrl -ne $apiUrl) {
            Write-Host "  ⚠️  API URL mismatch: Expected $apiUrl" -ForegroundColor Yellow
            $warnings += "Frontend API URL is $configuredUrl, expected $apiUrl"
        } else {
            Write-Host "  ✅ API URL is correctly configured" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ⚠️  Cannot find api.js file" -ForegroundColor Yellow
}

# Check Vite proxy configuration
$viteConfigPath = "frontend\vite.config.js"
if (Test-Path $viteConfigPath) {
    $viteConfigContent = Get-Content $viteConfigPath -Raw
    if ($viteConfigContent -match "proxy.*target.*8080") {
        Write-Host "  ✅ Vite proxy configured for backend" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Vite proxy may not be configured" -ForegroundColor Yellow
    }
}

# ============================================
# 5. Common Error Patterns
# ============================================
Write-Host ""
Write-Host "5. COMMON ERROR PATTERNS" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

Write-Host "  Checking for common issues..." -ForegroundColor Gray

# Check if backend port is accessible
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "  ✅ Port 8080 is in use" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 8080 is not in use" -ForegroundColor Red
    $issues += "Backend port 8080 is not listening"
}

# Check if frontend port is accessible
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "  ✅ Port 5173 is in use" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 5173 is not in use" -ForegroundColor Red
    $issues += "Frontend port 5173 is not listening"
}

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ No issues found! Connection should work." -ForegroundColor Green
    Write-Host ""
    Write-Host "If you still see errors in browser:" -ForegroundColor Yellow
    Write-Host "1. Open browser console (F12)" -ForegroundColor White
    Write-Host "2. Check Network tab for failed requests" -ForegroundColor White
    Write-Host "3. Look for CORS errors or 401/403 errors" -ForegroundColor White
} else {
    if ($issues.Count -gt 0) {
        Write-Host "❌ CRITICAL ISSUES FOUND:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  • $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  WARNINGS:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "RECOMMENDED ACTIONS:" -ForegroundColor Cyan
    Write-Host "1. Verify both servers are running" -ForegroundColor White
    Write-Host "2. Check browser console (F12) for specific errors" -ForegroundColor White
    Write-Host "3. Verify CORS configuration in backend" -ForegroundColor White
    Write-Host "4. Check network tab for request/response details" -ForegroundColor White
}

Write-Host ""
Write-Host "BROWSER TESTING:" -ForegroundColor Cyan
Write-Host "1. Open: $frontendUrl" -ForegroundColor White
Write-Host "2. Press F12 to open developer console" -ForegroundColor White
Write-Host "3. Look for:" -ForegroundColor White
Write-Host "   - CORS errors (red text)" -ForegroundColor Gray
Write-Host "   - Network errors (404, 403, 401)" -ForegroundColor Gray
Write-Host "   - Connection refused errors" -ForegroundColor Gray
Write-Host "4. Check Network tab -> XHR/Fetch requests" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

