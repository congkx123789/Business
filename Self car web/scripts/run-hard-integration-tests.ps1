# SelfCar - Run Hard Integration Tests
# Runs comprehensive integration tests with complex scenarios

Write-Host ""
Write-Host "🔥 Running Hard Integration Tests..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

Write-Host "📦 End-to-End Integration Tests" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=IntegrationEndToEndTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ End-to-end tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ End-to-end tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "💾 Database Transaction Tests" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=DatabaseTransactionTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Transaction tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Transaction tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔒 Data Integrity Tests" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
mvn test -Dtest=DataIntegrityTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Data integrity tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Data integrity tests failed" -ForegroundColor Red
}

Set-Location ..

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Hard Integration Test Suite Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 These tests verify:" -ForegroundColor Cyan
Write-Host "   • Complete user journeys" -ForegroundColor White
Write-Host "   • Transaction boundaries and rollbacks" -ForegroundColor White
Write-Host "   • ACID properties" -ForegroundColor White
Write-Host "   • Database constraints and integrity" -ForegroundColor White
Write-Host "   • Complex multi-user scenarios" -ForegroundColor White
Write-Host ""

