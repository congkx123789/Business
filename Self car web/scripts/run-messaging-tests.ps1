# SelfCar Messaging API - Test Runner Script
# This script runs all messaging-related tests

Write-Host ""
Write-Host "🧪 SelfCar Messaging API - Test Runner" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location backend

Write-Host "📦 Running ChatService Tests..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=ChatServiceTest -q
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ChatService tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ ChatService tests failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "📦 Running ChatController Tests..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=ChatControllerTest -q
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ChatController tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ ChatController tests failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "📦 Running Integration Tests..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=MessagingIntegrationTest -q
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Integration tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Integration tests failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "📦 Running All Messaging Tests..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=ChatServiceTest,ChatControllerTest,MessagingIntegrationTest -q
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All messaging tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some messaging tests failed!" -ForegroundColor Red
}
Write-Host ""

Set-Location ..

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Review test results above" -ForegroundColor White
Write-Host "   2. Use Postman collection for API testing" -ForegroundColor White
Write-Host "   3. Test real-time updates in browser console" -ForegroundColor White
Write-Host "   4. Check TESTING_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host ""

