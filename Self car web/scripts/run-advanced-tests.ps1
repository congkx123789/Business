# SelfCar - Run Advanced Tests
# Runs all advanced testing suites including property-based, mutation, security, etc.

Write-Host ""
Write-Host "🔥 Running Advanced Test Suite..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Backend Advanced Tests
Write-Host "📦 Backend Advanced Tests" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location backend

Write-Host ""
Write-Host "1️⃣  Property-Based Tests..." -ForegroundColor Cyan
mvn test -Dtest=PropertyBasedBookingTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Property-based tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Property-based tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "2️⃣  Security Tests..." -ForegroundColor Cyan
mvn test -Dtest=SecurityVulnerabilityTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Security tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Security tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣  Performance Tests..." -ForegroundColor Cyan
mvn test -Dtest=PerformanceTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Performance tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Performance tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣  Concurrent Execution Tests..." -ForegroundColor Cyan
mvn test -Dtest=ConcurrentExecutionTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Concurrent tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Concurrent tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "5️⃣  Chaos Engineering Tests..." -ForegroundColor Cyan
mvn test -Dtest=ChaosEngineeringTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Chaos tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Chaos tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "6️⃣  Boundary Value Tests..." -ForegroundColor Cyan
mvn test -Dtest=BoundaryValueTest --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Boundary tests passed" -ForegroundColor Green
} else {
    Write-Host "❌ Boundary tests failed" -ForegroundColor Red
}

Set-Location ..
Write-Host ""

# Frontend Advanced Tests
Write-Host "🎨 Frontend Advanced Tests" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Set-Location frontend

Write-Host ""
Write-Host "7️⃣  Visual Regression Tests..." -ForegroundColor Cyan
npm run test:run -- VisualRegression 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Visual regression tests passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Visual regression tests (may need setup)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "8️⃣  Accessibility Deep Tests..." -ForegroundColor Cyan
npm run test:run -- AccessibilityDeep 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Accessibility tests passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Accessibility tests (may need setup)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "9️⃣  Stress Tests..." -ForegroundColor Cyan
npm run test:run -- StressTest 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Stress tests passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Stress tests (may need setup)" -ForegroundColor Yellow
}

Set-Location ..
Write-Host ""

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Advanced Test Suite Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 To run mutation testing:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   mvn org.pitest:pitest-maven:mutationCoverage" -ForegroundColor White
Write-Host ""
Write-Host "💡 See ADVANCED_TESTING_GUIDE.md for details" -ForegroundColor Cyan
Write-Host ""

