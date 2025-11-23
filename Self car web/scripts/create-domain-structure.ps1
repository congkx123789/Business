# Project Reorganization Script
# Creates domain-based folder structure and moves files

$basePath = "D:\Business\Self car web\backend\src\main\java\com\selfcar"

# Create domain folders
$types = @("controller", "service", "model", "repository", "dto")
$domains = @("auth", "car", "order", "payment", "booking", "shop", "analytics", "logistics", "common")

foreach ($type in $types) {
    foreach ($domain in $domains) {
        $typePath = Join-Path $basePath $type
        $path = Join-Path $typePath $domain
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Host "Created: $path"
        }
    }
}

Write-Host "Folder structure created successfully!"

