# Script to update package declarations for moved files
$basePath = "D:\Business\Self car web\backend\src\main\java\com\selfcar"

# Function to update package declaration
function Update-PackageDeclaration {
    param($filePath, $correctPackage)
    
    $content = Get-Content $filePath -Raw
    $oldPackage = if ($content -match '^package\s+([^;]+);') { $matches[1] } else { $null }
    
    if ($oldPackage -and $oldPackage -ne $correctPackage) {
        $content = $content -replace "package\s+$([regex]::Escape($oldPackage));", "package $correctPackage;"
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Updated: $filePath - $oldPackage -> $correctPackage"
    }
}

# Map files to their correct packages
Get-ChildItem -Path $basePath -Recurse -Filter "*.java" | ForEach-Object {
    $relativePath = $_.FullName.Replace($basePath, "").Replace("\", "/").TrimStart("/")
    $directory = $_.DirectoryName.Replace($basePath, "").Replace("\", ".").TrimStart(".")
    
    if ($relativePath -match "^(controller|model|dto|service)/([^/]+)/") {
        $layer = $matches[1]
        $domain = $matches[2]
        
        if ($directory -match "com\.selfcar\.$layer\.$domain") {
            $correctPackage = "com.selfcar.$layer.$domain"
            Update-PackageDeclaration $_.FullName $correctPackage
        }
    }
}

Write-Host "Package update complete!"

