# Force Clear All Vite Caches
# This script aggressively removes all possible Vite cache files

Write-Host ""
Write-Host "Force clearing ALL Vite caches..." -ForegroundColor Cyan
Write-Host ""

$frontendPath = "frontend"
Set-Location $frontendPath

# 1. Remove cache directories
Write-Host "1. Removing cache directories..." -ForegroundColor Yellow
$cacheDirs = @(".vite", "node_modules\.vite")
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   Removed: $dir" -ForegroundColor Green
    }
}

# 2. Remove all timestamp files
Write-Host ""
Write-Host "2. Removing all timestamp files..." -ForegroundColor Yellow
$timestampFiles = Get-ChildItem -Path "." -Recurse -File -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -like "*timestamp*" -or 
    $_.Name -like "*1762396761433*" -or
    $_.Extension -eq ".mjs" -and $_.Name -like "*vite.config*"
}
if ($timestampFiles) {
    foreach ($file in $timestampFiles) {
        Write-Host "   Removing: $($file.Name)" -ForegroundColor Gray
        Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   Removed $($timestampFiles.Count) file(s)" -ForegroundColor Green
} else {
    Write-Host "   No timestamp files found" -ForegroundColor Green
}

# 3. Search in node_modules/vite
Write-Host ""
Write-Host "3. Searching in node_modules/vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\vite") {
    $viteCaches = Get-ChildItem -Path "node_modules\vite" -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -like "*timestamp*" -or $_.Name -like "*1762396761433*"
    }
    if ($viteCaches) {
        foreach ($file in $viteCaches) {
            Write-Host "   Found in vite: $($file.Name)" -ForegroundColor Red
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   Removed $($viteCaches.Count) file(s) from vite" -ForegroundColor Green
    } else {
        Write-Host "   No cache files in vite" -ForegroundColor Green
    }
}

# 4. Clear npm cache related to vite
Write-Host ""
Write-Host "4. Checking npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "   npm cache cleared" -ForegroundColor Green
} catch {
    Write-Host "   Could not clear npm cache" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All caches cleared!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now try starting the server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""

Set-Location ..

