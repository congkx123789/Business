# Script để backup H2 database
param(
    [string]$BackupPath = "backups"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "💾 Backup H2 Database" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$dbFile = "data\selfcar_db.mv.db"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = $BackupPath
$backupFile = "$backupDir\selfcar_db_$timestamp.mv.db"

# Kiểm tra file database có tồn tại không
if (-not (Test-Path $dbFile)) {
    Write-Host "❌ Không tìm thấy file database: $dbFile" -ForegroundColor Red
    Write-Host "   Database có thể chưa được tạo hoặc đang dùng in-memory mode" -ForegroundColor Yellow
    exit 1
}

# Tạo thư mục backup nếu chưa có
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "✅ Đã tạo thư mục backup: $backupDir" -ForegroundColor Green
}

# Copy file database
try {
    Copy-Item -Path $dbFile -Destination $backupFile -Force
    $fileSize = (Get-Item $backupFile).Length / 1MB
    Write-Host "✅ Backup thành công!" -ForegroundColor Green
    Write-Host "   File: $backupFile" -ForegroundColor White
    Write-Host "   Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Để restore, copy file backup vào: data\selfcar_db.mv.db" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Lỗi khi backup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

