# SelfCar Login Test Script

Write-Host "🔐 Testing SelfCar Login API..." -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:8080"
$loginEndpoint = "$backendUrl/api/auth/login"

# Test Customer Login
Write-Host "📋 Testing Customer Login..." -ForegroundColor Yellow
$customerLogin = @{
    email = "john.doe@example.com"
    password = "password"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $loginEndpoint `
        -Method POST `
        -ContentType "application/json" `
        -Body $customerLogin `
        -ErrorAction Stop
    
    Write-Host "✅ Customer Login Successful!" -ForegroundColor Green
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Name: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Gray
    Write-Host "   Role: $($response.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0, [Math]::Min(50, $response.token.Length)))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Customer Login Failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test Admin Login
Write-Host "📋 Testing Admin Login..." -ForegroundColor Yellow
$adminLogin = @{
    email = "admin@selfcar.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $loginEndpoint `
        -Method POST `
        -ContentType "application/json" `
        -Body $adminLogin `
        -ErrorAction Stop
    
    Write-Host "✅ Admin Login Successful!" -ForegroundColor Green
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Name: $($response.user.firstName) $($response.user.lastName)" -ForegroundColor Gray
    Write-Host "   Role: $($response.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0, [Math]::Min(50, $response.token.Length)))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Admin Login Failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test Invalid Login
Write-Host "📋 Testing Invalid Credentials..." -ForegroundColor Yellow
$invalidLogin = @{
    email = "wrong@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $loginEndpoint `
        -Method POST `
        -ContentType "application/json" `
        -Body $invalidLogin `
        -ErrorAction Stop
    Write-Host "❌ Invalid Login Test Failed (should have rejected)" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid Credentials Correctly Rejected!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🎯 Login Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Test Credentials:" -ForegroundColor Yellow
Write-Host "   Customer: john.doe@example.com / password" -ForegroundColor Gray
Write-Host "   Admin: admin@selfcar.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend URL: http://localhost:8080" -ForegroundColor Cyan

