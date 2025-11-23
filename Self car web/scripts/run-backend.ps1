# SelfCar - Run Backend Script

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
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
Write-Host "📍 Backend will run on: http://localhost:8080" -ForegroundColor Yellow
Write-Host "📍 API Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Cyan
Write-Host ""

mvn spring-boot:run

