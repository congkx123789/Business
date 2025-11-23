# Apply BullExplorer patch to @nestjs/bull
# This fixes the ModuleRef dependency issue in websocket-service

Write-Host "Applying @nestjs/bull BullExplorer patch..." -ForegroundColor Cyan

$bullPaths = Get-ChildItem "node_modules\.pnpm" -Directory | Where-Object { $_.Name -like "*@nestjs+bull@10.2.3*" }

if ($bullPaths.Count -eq 0) {
    Write-Host "  ⚠ @nestjs/bull@10.2.3 not found, skipping patch" -ForegroundColor Yellow
    exit 0
}

foreach ($bullPath in $bullPaths) {
    $filePath = Join-Path $bullPath "node_modules\@nestjs\bull\dist\bull.module.js"
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  ⚠ File not found: $filePath" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $filePath -Raw
    if ($content -match "providers: \[bull_explorer_1\.BullExplorer, bull_metadata_accessor_1\.BullMetadataAccessor\]") {
        $newContent = $content -replace 'providers: \[bull_explorer_1\.BullExplorer, bull_metadata_accessor_1\.BullMetadataAccessor\],', 'providers: [bull_metadata_accessor_1.BullMetadataAccessor],'
        Set-Content -Path $filePath -Value $newContent -NoNewline
        Write-Host "  ✅ Patched: $filePath" -ForegroundColor Green
    } elseif ($content -match "providers: \[bull_metadata_accessor_1\.BullMetadataAccessor\]") {
        Write-Host "  ✓ Already patched: $filePath" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Unexpected content in: $filePath" -ForegroundColor Yellow
    }
}

Write-Host "Patch application complete!" -ForegroundColor Green

