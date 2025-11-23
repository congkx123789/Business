param(
    [string]$ProjectDir = "backend",
    [string]$OutputDir = "reports/dependency-check",
    [double]$FailOnCvss = 7.0
)

$ErrorActionPreference = "Stop"

Write-Host "Running OWASP Dependency-Check via Docker..."

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

docker run --rm -e "JAVA_OPTS=-Xmx2g" -v (Resolve-Path "."):"/src" -v (Resolve-Path $OutputDir):"/report" owasp/dependency-check:latest \
  --scan "/src/$ProjectDir" \
  --format "HTML,XML" \
  --project "selfcar-backend" \
  --out "/report" \
  --failOnCVSS $FailOnCvss

Write-Host "Reports generated in $OutputDir"

