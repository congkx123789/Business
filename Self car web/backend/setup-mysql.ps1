# Script để setup MySQL database cho SelfCar
param(
    [string]$DbName = "selfcar_db",
    [string]$DbUser = "root",
    [string]$DbPassword = "root",
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3308
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🗄️  Setup MySQL Database for SelfCar" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra MySQL client
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "❌ MySQL client chưa được cài đặt hoặc chưa có trong PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cách cài đặt MySQL:" -ForegroundColor Yellow
    Write-Host "1. Download MySQL từ: https://dev.mysql.com/downloads/mysql/" -ForegroundColor White
    Write-Host "2. Hoặc dùng Docker:" -ForegroundColor White
    Write-Host "   docker run -d --name mysql-selfcar -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sau khi cài đặt, thêm MySQL bin vào PATH và chạy lại script này" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL client đã được cài đặt" -ForegroundColor Green
Write-Host ""

# Kiểm tra kết nối MySQL
Write-Host "Kiểm tra kết nối MySQL..." -ForegroundColor Yellow
try {
    $testConnection = mysql -h $DbHost -P $DbPort -u $DbUser -p$DbPassword -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Kết nối MySQL thành công!" -ForegroundColor Green
    } else {
        Write-Host "❌ Không thể kết nối MySQL" -ForegroundColor Red
        Write-Host "   Kiểm tra:" -ForegroundColor Yellow
        Write-Host "   - MySQL server đã chạy chưa?" -ForegroundColor White
        Write-Host "   - Username/Password đúng chưa?" -ForegroundColor White
        Write-Host "   - Port $DbPort có đúng không?" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Lỗi kết nối: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Tạo database và user..." -ForegroundColor Yellow

# Tạo database
$createDbSql = @"
CREATE DATABASE IF NOT EXISTS $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DbName;
"@

try {
    $createDbSql | mysql -h $DbHost -P $DbPort -u $DbUser -p$DbPassword 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database '$DbName' đã được tạo hoặc đã tồn tại" -ForegroundColor Green
    } else {
        Write-Host "❌ Lỗi khi tạo database" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup MySQL hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Thông tin database:" -ForegroundColor Cyan
Write-Host "   Database: $DbName" -ForegroundColor White
Write-Host "   Host: $DbHost" -ForegroundColor White
Write-Host "   Port: $DbPort" -ForegroundColor White
Write-Host "   User: $DbUser" -ForegroundColor White
Write-Host ""
Write-Host "📝 Bước tiếp theo:" -ForegroundColor Yellow
Write-Host "   1. Cập nhật application-dev.properties với thông tin trên" -ForegroundColor White
Write-Host "   2. Chạy migration scripts từ thư mục database/" -ForegroundColor White
Write-Host "   3. Khởi động backend với profile 'dev': .\run-backend-mysql.ps1" -ForegroundColor White
Write-Host ""

