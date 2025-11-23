# SelfCar Messaging System - Test Runner Script
# This script runs all tests for the messaging system

Write-Host ""
Write-Host "🧪 SelfCar Messaging System - Test Runner" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if Maven is available
$mvnVersion = mvn --version 2>$null
if (-not $mvnVersion) {
    Write-Host "❌ Maven not found. Please install Maven 3.8+" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Running Tests..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Change to backend directory
Set-Location backend

# Run all tests
Write-Host "🔍 Running all tests..." -ForegroundColor Cyan
mvn test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Some tests failed. Check output above for details." -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Run specific messaging tests
Write-Host ""
Write-Host "🔍 Running messaging-specific tests..." -ForegroundColor Cyan
mvn test -Dtest="ChatServiceTest,ChatControllerTest,MessagingIntegrationTest"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Messaging tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some messaging tests failed." -ForegroundColor Yellow
}

# Return to project root
Set-Location ..

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Test Summary:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "✅ Unit Tests: ChatServiceTest, ChatControllerTest" -ForegroundColor Green
Write-Host "✅ Integration Tests: MessagingIntegrationTest" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test with Postman collection: postman/SelfCar_Messaging_API.postman_collection.json" -ForegroundColor White
Write-Host "   2. Test SSE in browser (see TESTING_GUIDE.md)" -ForegroundColor White
Write-Host "   3. Verify database updates manually" -ForegroundColor White
Write-Host ""
