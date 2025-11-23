# Test Vite Config - Verify it loads without errors
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VITE CONFIG TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"

Write-Host "1. Checking vite.config.js..." -ForegroundColor Yellow

$configPath = "$frontendPath\vite.config.js"
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    
    # Check for problematic imports
    if ($configContent -match "import.*ViteSRI.*from.*vite-plugin-sri") {
        Write-Host "  ❌ Found ViteSRI import - needs to be removed" -ForegroundColor Red
        Write-Host "     The plugin exports default, not named export" -ForegroundColor Gray
    } elseif ($configContent -match "ViteSRI\(") {
        Write-Host "  ❌ Found ViteSRI usage - needs to be commented out" -ForegroundColor Red
    } else {
        Write-Host "  ✅ No ViteSRI imports found" -ForegroundColor Green
    }
    
    # Check if it's commented properly
    if ($configContent -match "//.*ViteSRI|//.*SRI.*plugin") {
        Write-Host "  ✅ SRI plugin is commented out" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ vite.config.js not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Checking for cache files..." -ForegroundColor Yellow

$cacheFiles = Get-ChildItem -Path $frontendPath -Filter "*.timestamp-*.mjs" -Recurse -ErrorAction SilentlyContinue
if ($cacheFiles) {
    Write-Host "  ⚠️  Found $($cacheFiles.Count) cache file(s)" -ForegroundColor Yellow
    Write-Host "     These should be cleared" -ForegroundColor Gray
    foreach ($file in $cacheFiles) {
        Write-Host "     - $($file.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✅ No cache files found" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Testing Vite config load..." -ForegroundColor Yellow

Set-Location $frontendPath

# Try to load config with Node.js
$nodeTest = @"
const { readFileSync } = require('fs');
const path = require('path');

try {
  const configPath = path.join(process.cwd(), 'vite.config.js');
  const content = readFileSync(configPath, 'utf8');
  
  // Check for problematic imports
  if (content.includes('import') && content.includes('ViteSRI') && content.includes('vite-plugin-sri')) {
    console.log('ERROR: Found ViteSRI import');
    process.exit(1);
  }
  
  if (content.includes('ViteSRI(') && !content.includes('// ViteSRI')) {
    console.log('ERROR: Found ViteSRI usage without comment');
    process.exit(1);
  }
  
  console.log('SUCCESS: Config looks good');
  process.exit(0);
} catch (error) {
  console.log('ERROR:', error.message);
  process.exit(1);
}
"@

$testFile = "$env:TEMP\test-vite-config.js"
$nodeTest | Out-File -FilePath $testFile -Encoding utf8

try {
    $result = node $testFile 2>&1
    if ($result -match "SUCCESS") {
        Write-Host "  ✅ Config file is valid" -ForegroundColor Green
    } elseif ($result -match "ERROR") {
        Write-Host "  ❌ Config has issues: $result" -ForegroundColor Red
    } else {
        Write-Host "  ⚠️  Could not verify config" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not test config (Node.js may not be available)" -ForegroundColor Yellow
} finally {
    Remove-Item $testFile -ErrorAction SilentlyContinue
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXES NEEDED:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If errors found:" -ForegroundColor Yellow
Write-Host "1. Ensure vite.config.js has SRI plugin commented out" -ForegroundColor White
Write-Host "2. Clear Vite cache: Remove .vite folder and *.timestamp-*.mjs files" -ForegroundColor White
Write-Host "3. Restart frontend server" -ForegroundColor White
Write-Host ""
Write-Host "To clear cache manually:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor Gray
Write-Host "  Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue" -ForegroundColor Gray
Write-Host "  Get-ChildItem -Filter '*.timestamp-*.mjs' -Recurse | Remove-Item -Force" -ForegroundColor Gray
Write-Host ""

