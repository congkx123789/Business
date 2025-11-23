# Test API Connection Script
Write-Host "Testing Backend API Connection..."
Write-Host ""

# Test 1: Health endpoint
Write-Host "1. Testing /api/health endpoint..."
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 5
    Write-Host "   ✓ Health endpoint is working!"
    Write-Host "   Response: $($healthResponse | ConvertTo-Json -Compress)"
} catch {
    Write-Host "   ✗ Health endpoint failed: $($_.Exception.Message)"
    Write-Host "   Make sure backend is running on port 8080"
    exit 1
}

Write-Host ""

# Test 2: Test register endpoint (OPTIONS for CORS)
Write-Host "2. Testing CORS on /api/auth/register endpoint..."
try {
    $headers = @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register" -Method Options -Headers $headers -TimeoutSec 5
    Write-Host "   ✓ CORS preflight is working!"
    Write-Host "   CORS Headers:"
    $corsResponse.Headers | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
        Write-Host "     $($_.Key): $($_.Value)"
    }
} catch {
    Write-Host "   ⚠ CORS preflight test failed (this might be OK if endpoint doesn't support OPTIONS): $($_.Exception.Message)"
}

Write-Host ""
Write-Host "✓ All tests completed!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Make sure frontend .env has: VITE_API_BASE_URL=http://localhost:8080/api"
Write-Host "2. Start frontend: cd frontend && npm run dev"
Write-Host "3. Try registering at http://localhost:5173/register"

