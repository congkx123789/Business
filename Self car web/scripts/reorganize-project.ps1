# PowerShell script to reorganize project files
# Run this script from the project root

Write-Host "Starting project reorganization..." -ForegroundColor Cyan

# Create directories
$dirs = @('docs\phases', 'docs\testing', 'docs\setup', 'docs\frontend', 'scripts')
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Green
    }
}

# Move PowerShell scripts
Write-Host "`nMoving PowerShell scripts..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.ps1" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "scripts\" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move phase documentation
Write-Host "`nMoving phase documentation..." -ForegroundColor Yellow
@('PHASE3_IMPLEMENTATION.md', 'PHASE4_IMPLEMENTATION.md') | ForEach-Object {
    if (Test-Path $_) {
        Move-Item $_ -Destination "docs\phases\" -Force
        Write-Host "  Moved: $_" -ForegroundColor Gray
    }
}

# Move testing documentation
Write-Host "`nMoving testing documentation..." -ForegroundColor Yellow
@('*TEST*.md', '*TESTING*.md', '*FIX*.md') | ForEach-Object {
    Get-ChildItem -Path . -Filter $_ -File | Where-Object { $_.Name -ne 'README.md' } | ForEach-Object {
        Move-Item $_.FullName -Destination "docs\testing\" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

# Move setup documentation
Write-Host "`nMoving setup documentation..." -ForegroundColor Yellow
@('*SETUP*.md', '*GUIDE*.md', '*START*.md', 'QUICK_START.md', 'DEVELOPMENT*.md', 'README-SCRIPTS.md', 'ROADMAP*.md') | ForEach-Object {
    Get-ChildItem -Path . -Filter $_ -File | Where-Object { $_.Name -ne 'README.md' } | ForEach-Object {
        Move-Item $_.FullName -Destination "docs\setup\" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

# Move remaining documentation (except README.md and PROJECT_STRUCTURE.md)
Write-Host "`nMoving remaining documentation..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.md" -File | Where-Object { 
    $_.Name -ne 'README.md' -and 
    $_.Name -ne 'PROJECT_STRUCTURE.md' -and
    $_.Name -notlike 'docs\*'
} | ForEach-Object {
    Move-Item $_.FullName -Destination "docs\" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move frontend docs
Write-Host "`nMoving frontend documentation..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Get-ChildItem -Path "frontend" -Filter "*.md" -File | ForEach-Object {
        Move-Item $_.FullName -Destination "docs\frontend\" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

# Move backend docs
Write-Host "`nMoving backend documentation..." -ForegroundColor Yellow
if (Test-Path "backend\*.md") {
    Get-ChildItem -Path "backend" -Filter "*.md" -File | ForEach-Object {
        Move-Item $_.FullName -Destination "docs\testing\" -Force
        Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host "`nReorganization complete!" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Scripts: $((Get-ChildItem -Path 'scripts' -File -ErrorAction SilentlyContinue).Count) files" -ForegroundColor White
Write-Host "  Docs: $((Get-ChildItem -Path 'docs' -Recurse -File -ErrorAction SilentlyContinue).Count) files" -ForegroundColor White

