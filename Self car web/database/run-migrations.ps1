# Script để chạy tất cả migration scripts
param(
    [string]$DbName = "selfcar_db",
    [string]$DbUser = "root",
    [string]$DbPassword = "root",
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3308
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "📦 Running Database Migrations" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Danh sách scripts theo thứ tự
$scripts = @(
    "schema.sql",
    "seed_data.sql",
    "phase3_schema.sql",
    "phase5_schema.sql",
    "phase6_schema.sql"
)

$successCount = 0
$failCount = 0

foreach ($script in $scripts) {
    $scriptPath = Join-Path $PSScriptRoot $script
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "⚠️  Script không tồn tại: $script" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Running: $script..." -ForegroundColor Yellow
    
    try {
        Get-Content $scriptPath | mysql -h $DbHost -P $DbPort -u $DbUser -p$DbPassword $DbName 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $script - SUCCESS" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ $script - FAILED" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ $script - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 Tất cả migrations đã chạy thành công!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Một số migrations thất bại. Kiểm tra log ở trên." -ForegroundColor Yellow
}

