# Script to run backend with MySQL profile
cd $PSScriptRoot
Write-Host "📦 SelfCar Backend Server (MySQL)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Starting with MySQL profile..." -ForegroundColor Yellow
Write-Host "📍 URL: http://localhost:8080" -ForegroundColor Green
Write-Host ""

# Check if MySQL port is listening
Write-Host "Kiểm tra MySQL..." -ForegroundColor Yellow
try {
    $mysqlPort = Get-NetTCPConnection -LocalPort 3308 -State Listen -ErrorAction SilentlyContinue
    if ($mysqlPort) {
        Write-Host "✅ MySQL đang chạy trên port 3308" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port 3308 không LISTENING. Đảm bảo MySQL đã được khởi động." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Không thể kiểm tra MySQL port. Tiếp tục khởi động backend..." -ForegroundColor Yellow
}

Write-Host ""

# Build JAR if not exists
if (-not (Test-Path "target\selfcar-backend-1.0.0.jar")) {
    Write-Host "Building JAR file..." -ForegroundColor Yellow
    mvn clean package -DskipTests -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build thất bại!" -ForegroundColor Red
        exit 1
    }
}

# Run from JAR (to avoid Windows classpath length issue)
Write-Host "Starting backend from JAR with MySQL profile..." -ForegroundColor Yellow
java -jar target\selfcar-backend-1.0.0.jar --spring.profiles.active=dev

