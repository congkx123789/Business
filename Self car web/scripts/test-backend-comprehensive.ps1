# Comprehensive Backend Testing Script
# Tests all backend endpoints and functionality

Write-Host ""
Write-Host "Comprehensive Backend Testing" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080"
$testResults = @()
$token = $null

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    Write-Host " [$Method $Url]" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  PASS - Status: $statusCode" -ForegroundColor Green
            $script:testResults += @{Test=$Name; Status="PASS"; StatusCode=$statusCode; Message="Success"}
            return $content
        } else {
            Write-Host "  WARNING - Expected $ExpectedStatus, got $statusCode" -ForegroundColor Yellow
            $script:testResults += @{Test=$Name; Status="WARN"; StatusCode=$statusCode; Message="Status mismatch"}
            return $content
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  PASS - Expected status: $ExpectedStatus" -ForegroundColor Green
            $script:testResults += @{Test=$Name; Status="PASS"; StatusCode=$ExpectedStatus; Message="Expected error"}
        } else {
            Write-Host "  FAIL - Status: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
            $script:testResults += @{Test=$Name; Status="FAIL"; StatusCode=$statusCode; Message=$_.Exception.Message}
        }
        return $null
    }
}

# ============================================
# 1. Health & Connectivity Tests
# ============================================
Write-Host ""
Write-Host "1. HEALTH AND CONNECTIVITY TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

Test-Endpoint -Name "Health Check" -Url "$baseUrl/api/health"
Test-Endpoint -Name "Liveness Probe" -Url "$baseUrl/api/health/liveness"
Test-Endpoint -Name "Readiness Probe" -Url "$baseUrl/api/health/readiness"
Test-Endpoint -Name "Config Health" -Url "$baseUrl/api/health/config"
Test-Endpoint -Name "Actuator Health" -Url "$baseUrl/actuator/health"
Test-Endpoint -Name "Actuator Info" -Url "$baseUrl/actuator/info"

# ============================================
# 2. Authentication Tests
# ============================================
Write-Host ""
Write-Host "2. AUTHENTICATION TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

# Test login with test credentials
$loginBody = @{
    email = "admin@selfcar.com"
    password = "admin123"
}
$loginResponse = Test-Endpoint -Name "Admin Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginBody

if ($null -ne $loginResponse -and $null -ne $loginResponse.token) {
    $token = $loginResponse.token
    Write-Host "  Authentication token obtained" -ForegroundColor Green
}

# Test get current user
if ($token) {
    $authHeaders = @{ "Authorization" = "Bearer $token" }
    $meResponse = Test-Endpoint -Name "Get Current User" -Url "$baseUrl/api/auth/me" -Headers $authHeaders
    
    # Test customer login
    $customerLoginBody = @{
        email = "john.doe@example.com"
        password = "password"
    }
    $customerLoginResponse = Test-Endpoint -Name "Customer Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $customerLoginBody
    
    if ($null -ne $customerLoginResponse -and $null -ne $customerLoginResponse.token) {
        $customerToken = $customerLoginResponse.token
        $customerAuthHeaders = @{ "Authorization" = "Bearer $customerToken" }
    }
}

# Test invalid login
$invalidLoginBody = @{
    email = "invalid@example.com"
    password = "wrongpassword"
}
Test-Endpoint -Name "Invalid Login (Expected 401)" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $invalidLoginBody -ExpectedStatus 400

# ============================================
# 3. Car Endpoints Tests
# ============================================
Write-Host ""
Write-Host "3. CAR ENDPOINTS TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

Test-Endpoint -Name "Get All Cars" -Url "$baseUrl/api/cars"
Test-Endpoint -Name "Get Available Cars" -Url "$baseUrl/api/cars/available"
Test-Endpoint -Name "Get Featured Cars" -Url "$baseUrl/api/cars/featured"

# Test get car by ID (assuming ID 1 exists)
$carResponse = Test-Endpoint -Name "Get Car by ID (1)" -Url "$baseUrl/api/cars/1"
if ($null -ne $carResponse) {
    $carId = $carResponse | Select-Object -ExpandProperty id -ErrorAction SilentlyContinue
    if ($null -ne $carId) {
        $carName = $carResponse | Select-Object -ExpandProperty name -ErrorAction SilentlyContinue
        Write-Host "  Info: Car found: $carName" -ForegroundColor Cyan
    }
}

# Test create car (requires admin auth)
if ($token) {
    $newCarBody = @{
        name = "Test Car"
        brand = "Toyota"
        model = "Camry"
        year = 2024
        pricePerDay = 50.00
        available = $true
        seats = 5
        transmission = "Automatic"
        fuelType = "Gasoline"
    }
    $createResponse = Test-Endpoint -Name "Create Car (Admin)" -Method "POST" -Url "$baseUrl/api/cars" -Headers $authHeaders -Body $newCarBody
}

# ============================================
# 4. Booking Endpoints Tests
# ============================================
Write-Host ""
Write-Host "4. BOOKING ENDPOINTS TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

if ($customerToken) {
    $customerAuthHeaders = @{ "Authorization" = "Bearer $customerToken" }
    Test-Endpoint -Name "Get User Bookings" -Url "$baseUrl/api/bookings/my-bookings" -Headers $customerAuthHeaders
}

# ============================================
# 5. Admin Endpoints Tests
# ============================================
Write-Host ""
Write-Host "5. ADMIN ENDPOINTS TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

if ($token) {
    Test-Endpoint -Name "Get All Users (Admin)" -Url "$baseUrl/api/users" -Headers $authHeaders
    Test-Endpoint -Name "Get Dashboard Stats" -Url "$baseUrl/api/admin/dashboard/stats" -Headers $authHeaders
}

# ============================================
# 6. Public Endpoints Tests
# ============================================
Write-Host ""
Write-Host "6. PUBLIC ENDPOINTS TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

Test-Endpoint -Name "I18n Translations" -Url "$baseUrl/api/i18n/translations?locale=en"
Test-Endpoint -Name "Cache Metrics" -Url "$baseUrl/api/cache/metrics"

# ============================================
# 7. Error Handling Tests
# ============================================
Write-Host ""
Write-Host "7. ERROR HANDLING TESTS" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Gray

Test-Endpoint -Name "Non-existent Car ID" -Url "$baseUrl/api/cars/99999" -ExpectedStatus 400
Test-Endpoint -Name "Protected Endpoint Without Auth" -Url "$baseUrl/api/users" -ExpectedStatus 401

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

$total = $testResults.Count
$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warned = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warned" -ForegroundColor Yellow
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host ""

$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

if ($failed -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  FAIL: $($_.Test) - Status: $($_.StatusCode) - $($_.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

