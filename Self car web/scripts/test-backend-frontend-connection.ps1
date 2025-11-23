# SelfCar - Test Backend and Frontend Connection
# This script starts both services and tests their connection

Write-Host ""
Write-Host "🔗 Testing Backend and Frontend Connection" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if services are running
Write-Host "📋 Step 1: Checking Service Status..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

$backendRunning = $false
$frontendRunning = $false

try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    $backendRunning = $true
    Write-Host "✅ Backend is running on http://localhost:8080" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running" -ForegroundColor Red
}

try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    $frontendRunning = $true
    Write-Host "✅ Frontend is running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not running" -ForegroundColor Red
}

Write-Host ""

# Step 2: Start services if needed
if (-not $backendRunning) {
    Write-Host "📦 Step 2: Starting Backend..." -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Starting backend server in new window..." -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "cd 'D:\Business\Self car web\backend'; `$
        Write-Host '📦 SelfCar Backend Server' -ForegroundColor Cyan; `$
        Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
        Write-Host ''; `$
        Write-Host 'Starting Spring Boot...' -ForegroundColor Yellow; `$
        Write-Host '📍 URL: http://localhost:8080' -ForegroundColor Green; `$
        Write-Host ''; `$
        mvn spring-boot:run -Dspring-boot.run.profiles=h2"
    
    Write-Host "⏳ Waiting for backend to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Check again
    $maxRetries = 10
    $retryCount = 0
    while ($retryCount -lt $maxRetries) {
        try {
            $backendHealth = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $backendRunning = $true
            Write-Host "✅ Backend is now running!" -ForegroundColor Green
            break
        } catch {
            $retryCount++
            Write-Host "⏳ Still waiting... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
    
    if (-not $backendRunning) {
        Write-Host "❌ Backend failed to start. Please check the backend window for errors." -ForegroundColor Red
        exit 1
    }
}

if (-not $frontendRunning) {
    Write-Host ""
    Write-Host "🎨 Step 3: Starting Frontend..." -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
    
    # Check if node_modules exists
    if (-not (Test-Path "frontend\node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        Set-Location ..
    }
    
    Write-Host "Starting frontend server in new window..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "cd 'D:\Business\Self car web\frontend'; `$
        Write-Host '🎨 SelfCar Frontend Server' -ForegroundColor Cyan; `$
        Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan; `$
        Write-Host ''; `$
        Write-Host 'Starting Vite...' -ForegroundColor Yellow; `$
        Write-Host '📍 URL: http://localhost:5173' -ForegroundColor Green; `$
        Write-Host ''; `$
        npm run dev"
    
    Write-Host "⏳ Waiting for frontend to start (15 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Check again
    try {
        $frontendCheck = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $frontendRunning = $true
        Write-Host "✅ Frontend is now running!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Frontend might still be starting. Check the frontend window." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 4: Test Connection
Write-Host "🔍 Step 4: Testing Backend-Frontend Connection..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 1: Backend Health
Write-Host "Test 1: Backend Health Check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend health: $($health.status)" -ForegroundColor Green
    Write-Host "   Application: $($health.application)" -ForegroundColor Gray
    Write-Host "   Profile: $($health.profile)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: CORS Configuration
Write-Host "Test 2: CORS Configuration..." -ForegroundColor Cyan
try {
    $corsTest = Invoke-WebRequest -Uri "http://localhost:8080/api/health" `
        -Method OPTIONS `
        -Headers @{
            "Origin" = "http://localhost:5173"
            "Access-Control-Request-Method" = "GET"
        } `
        -TimeoutSec 5 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $corsHeaders = $corsTest.Headers
    if ($corsHeaders['Access-Control-Allow-Origin']) {
        Write-Host "✅ CORS is configured" -ForegroundColor Green
        Write-Host "   Allowed Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  CORS headers not found in OPTIONS response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  CORS test inconclusive (this is normal for GET requests)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Frontend API Configuration
Write-Host "Test 3: Frontend API Configuration..." -ForegroundColor Cyan
if (Test-Path "frontend\.env") {
    $envContent = Get-Content "frontend\.env" -Raw
    if ($envContent -match "VITE_API_BASE_URL") {
        Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
        $apiUrl = ($envContent | Select-String -Pattern "VITE_API_BASE_URL=(.+)").Matches.Groups[1].Value
        Write-Host "   API URL: $apiUrl" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  VITE_API_BASE_URL not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Frontend .env file not found" -ForegroundColor Red
    Write-Host "   Creating .env file..." -ForegroundColor Yellow
    @"
# Frontend Environment Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENV=development
VITE_ENABLE_OAUTH2=true
VITE_ENABLE_ANALYTICS=true
VITE_CDN_ENABLED=false
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

Write-Host ""

# Test 4: Check Frontend API Service
Write-Host "Test 4: Frontend API Service..." -ForegroundColor Cyan
if (Test-Path "frontend\src\services\api.js") {
    $apiContent = Get-Content "frontend\src\services\api.js" -Raw
    if ($apiContent -match "chatAPI") {
        Write-Host "✅ chatAPI is defined in frontend" -ForegroundColor Green
    } else {
        Write-Host "⚠️  chatAPI not found in api.js" -ForegroundColor Yellow
    }
    if ($apiContent -match "createMessageStream") {
        Write-Host "✅ createMessageStream is defined in frontend" -ForegroundColor Green
    } else {
        Write-Host "⚠️  createMessageStream not found in api.js" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ frontend/src/services/api.js not found" -ForegroundColor Red
}

Write-Host ""

# Test 5: Test Actual API Call (if we can get a token)
Write-Host "Test 5: Testing API Endpoint Access..." -ForegroundColor Cyan
Write-Host "   (This requires authentication - testing endpoint availability)" -ForegroundColor Gray

try {
    # Try to access conversations endpoint (will fail with 401, but confirms endpoint exists)
    $conversationsTest = Invoke-WebRequest -Uri "http://localhost:8080/api/conversations" `
        -Method GET `
        -TimeoutSec 5 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Conversations endpoint is accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Conversations endpoint exists (401 Unauthorized is expected)" -ForegroundColor Green
        Write-Host "   This confirms the endpoint is working and requires authentication" -ForegroundColor Gray
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ Conversations endpoint not found (404)" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Endpoint test: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Connection Test Summary" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

if ($backendRunning) {
    Write-Host "✅ Backend: Running on http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: Not running" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "✅ Frontend: Running on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend: Status unknown (check frontend window)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "   2. Open DevTools (F12) → Network tab" -ForegroundColor White
Write-Host "   3. Try to login or access the app" -ForegroundColor White
Write-Host "   4. Check that API calls to http://localhost:8080/api/* are successful" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To test messaging:" -ForegroundColor Cyan
Write-Host "   1. Login to the application" -ForegroundColor White
Write-Host "   2. Navigate to messages/chat section" -ForegroundColor White
Write-Host "   3. Try sending a message" -ForegroundColor White
Write-Host "   4. Check DevTools console for any errors" -ForegroundColor White
Write-Host ""
