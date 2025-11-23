# SelfCar - Diagnose Startup Issues
# This script helps identify why the project won't start

Write-Host ""
Write-Host "🔍 Diagnosing Startup Issues" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check 1: Java Version
Write-Host "1. Checking Java Version..." -ForegroundColor Yellow
$javaVersion = java -version 2>&1 | Select-String -Pattern "version"
if ($javaVersion) {
    Write-Host "   ✅ Java found: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Java not found! Please install Java 17+" -ForegroundColor Red
}

# Check 2: Maven Version
Write-Host ""
Write-Host "2. Checking Maven Version..." -ForegroundColor Yellow
$mvnVersion = mvn --version 2>&1 | Select-String -Pattern "Apache Maven"
if ($mvnVersion) {
    Write-Host "   ✅ Maven found: $mvnVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Maven not found! Please install Maven 3.8+" -ForegroundColor Red
}

# Check 3: Port Availability
Write-Host ""
Write-Host "3. Checking Port Availability..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "   ⚠️  Port 8080 is in use by PID: $($port8080.OwningProcess)" -ForegroundColor Yellow
    Write-Host "   💡 Kill process: Stop-Process -Id $($port8080.OwningProcess) -Force" -ForegroundColor Gray
} else {
    Write-Host "   ✅ Port 8080 is available" -ForegroundColor Green
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "   ⚠️  Port 5173 is in use by PID: $($port5173.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Port 5173 is available" -ForegroundColor Green
}

# Check 4: Required Files
Write-Host ""
Write-Host "4. Checking Required Files..." -ForegroundColor Yellow

$requiredFiles = @(
    "backend\src\main\java\com\selfcar\service\common\RealtimeMessageService.java",
    "backend\src\main\java\com\selfcar\controller\common\RealtimeMessageController.java",
    "backend\src\main\java\com\selfcar\controller\common\ChatController.java",
    "backend\src\main\java\com\selfcar\service\car\ChatService.java",
    "backend\pom.xml",
    "frontend\package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file - MISSING!" -ForegroundColor Red
    }
}

# Check 5: Compilation
Write-Host ""
Write-Host "5. Testing Compilation..." -ForegroundColor Yellow
Set-Location backend
$compileResult = mvn clean compile 2>&1
$compileErrors = $compileResult | Select-String -Pattern "ERROR|FAILURE"

if ($compileErrors) {
    Write-Host "   ❌ Compilation errors found:" -ForegroundColor Red
    $compileErrors | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ Compilation successful" -ForegroundColor Green
}

Set-Location ..

# Check 6: Configuration Files
Write-Host ""
Write-Host "6. Checking Configuration..." -ForegroundColor Yellow

if (Test-Path "backend\src\main\resources\application-h2.properties") {
    Write-Host "   ✅ application-h2.properties exists" -ForegroundColor Green
    $h2Config = Get-Content "backend\src\main\resources\application-h2.properties" -Raw
    if ($h2Config -match "spring.datasource.url") {
        Write-Host "   ✅ Database configuration found" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ application-h2.properties missing!" -ForegroundColor Red
}

if (Test-Path "frontend\.env") {
    Write-Host "   ✅ frontend/.env exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  frontend/.env missing (will be created automatically)" -ForegroundColor Yellow
}

# Check 7: Dependencies
Write-Host ""
Write-Host "7. Checking Dependencies..." -ForegroundColor Yellow
Set-Location backend
$depResult = mvn dependency:resolve 2>&1 | Select-String -Pattern "ERROR|FAILURE"
if ($depResult) {
    Write-Host "   ❌ Dependency issues:" -ForegroundColor Red
    $depResult | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ Dependencies resolved" -ForegroundColor Green
}
Set-Location ..

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Common Issues and Solutions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Port Already in Use:" -ForegroundColor Cyan
Write-Host "   Stop-Process -Id <PID> -Force" -ForegroundColor White
Write-Host ""
Write-Host "2. Compilation Errors:" -ForegroundColor Cyan
Write-Host "   cd backend && mvn clean compile" -ForegroundColor White
Write-Host ""
Write-Host "3. Missing Dependencies:" -ForegroundColor Cyan
Write-Host "   cd backend && mvn clean install" -ForegroundColor White
Write-Host ""
Write-Host "4. Database Issues:" -ForegroundColor Cyan
Write-Host "   Check application-h2.properties configuration" -ForegroundColor White
Write-Host ""
Write-Host "5. Start Backend Manually:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   mvn spring-boot:run -Dspring-boot.run.profiles=h2" -ForegroundColor White
Write-Host ""



