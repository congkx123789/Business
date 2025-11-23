param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,
    [ValidateSet('Chrome','Edge','Firefox')]
    [string[]]$Browsers = @('Chrome','Edge','Firefox'),
    [switch]$SystemWide
)

if (-not (Test-Path $ManifestPath)) {
    Write-Error "Manifest not found: $ManifestPath"
    exit 1
}

$manifest = Get-Content -Raw -Path $ManifestPath | ConvertFrom-Json
$name = $manifest.name
if (-not $name) { Write-Error 'Manifest missing name'; exit 1 }

$root = if ($SystemWide) { 'HKLM' } else { 'HKCU' }

function Set-Key($path, $value) {
    if (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
    New-ItemProperty -Path $path -Name '(default)' -Value $value -PropertyType String -Force | Out-Null
}

foreach ($b in $Browsers) {
    switch ($b) {
        'Chrome'  { $sub = 'Software\\Google\\Chrome\\NativeMessagingHosts' }
        'Edge'    { $sub = 'Software\\Microsoft\\Edge\\NativeMessagingHosts' }
        'Firefox' { $sub = 'Software\\Mozilla\\NativeMessagingHosts' }
    }
    $keyPath = "${root}:\\$sub\\$name"
    Write-Host "Registering $name for $b at $keyPath -> $ManifestPath"
    Set-Key -path $keyPath -value (Resolve-Path -LiteralPath $ManifestPath)
}

Write-Host 'Done.'


