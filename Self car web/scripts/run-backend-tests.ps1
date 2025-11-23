# SelfCar - Run Backend Tests Script

Write-Host "📦 Running Backend Tests..." -ForegroundColor Cyan
Write-Host ""

# Check if Java and Maven are available
$javaVersion = java --version 2>$null
$mvnVersion = mvn --version 2>$null

if (-not $javaVersion) {
    Write-Host "❌ Java not found. Please install Java 17+" -ForegroundColor Red
    exit 1
}
if (-not $mvnVersion) {
    Write-Host "❌ Maven not found. Please install Maven 3.8+" -ForegroundColor Red
    exit 1
}

Set-Location backend
mvn test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Backend tests passed!" -ForegroundColor Green
    Set-Location ..
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Backend tests failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

