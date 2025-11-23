# Script to run backend with H2 profile
cd $PSScriptRoot
Write-Host "📦 SelfCar Backend Server" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Starting with H2 profile..." -ForegroundColor Yellow
Write-Host "📍 URL: http://localhost:8080" -ForegroundColor Green
Write-Host ""

# Build JAR if not exists
if (-not (Test-Path "target\selfcar-backend-1.0.0.jar")) {
    Write-Host "Building JAR file..." -ForegroundColor Yellow
    mvn clean package -DskipTests -q
}

# Run from JAR (to avoid Windows classpath length issue)
Write-Host "Starting backend from JAR..." -ForegroundColor Yellow
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=h2

