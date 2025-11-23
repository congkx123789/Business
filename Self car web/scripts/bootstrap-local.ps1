# Bootstrap local build and run for SelfCar (Windows PowerShell 7+)
# - Verifies Docker Desktop and Node >= 18
# - Builds backend, starts infra via Docker, starts backend container, checks health
# - Builds frontend and runs unit tests
# - Optionally starts prod-style stack

param(
    [switch]$SkipFrontend,
    [switch]$SkipProd
)

$ErrorActionPreference = 'Stop'

function Write-Section($title) {
    Write-Host "`n==== $title ====\n" -ForegroundColor Cyan
}

function Test-Command($name) {
    $null -ne (Get-Command $name -ErrorAction SilentlyContinue)
}

function Ensure-Docker {
    if (-not (Test-Command 'docker')) {
        Write-Host "Docker CLI not found on PATH." -ForegroundColor Red
        Write-Host "Install Docker Desktop and ensure 'Use the WSL 2 based engine' is enabled." -ForegroundColor Yellow
        Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        throw "Docker not installed or not on PATH"
    }
}

function Ensure-Node18 {
    if (-not (Test-Command 'node')) {
        throw "Node.js not found. Install Node 18+ from https://nodejs.org/en/download"
    }
    $ver = (node -v).TrimStart('v')
    $major = [int]($ver.Split('.')[0])
    if ($major -lt 18) {
        throw "Node $ver detected. Please use Node 18+ (MSW v2 requires ESM)"
    }
}

function Invoke-CurlOk($url) {
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400)
    } catch { return $false }
}

$root = (Split-Path -Parent $PSCommandPath)
if ([string]::IsNullOrWhiteSpace($root)) { $root = $PSScriptRoot }
$projectRoot = Split-Path -Parent $root

Write-Section "Environment checks"
Ensure-Docker
Ensure-Node18
Write-Host "Docker and Node checks passed." -ForegroundColor Green

Write-Section "Backend build"
Push-Location (Join-Path $projectRoot 'backend')
try {
    mvn -q -DskipTests package
    Write-Host "Backend build OK." -ForegroundColor Green
} finally { Pop-Location }

Write-Section "Start infra containers (db, redis, zookeeper, kafka, elasticsearch)"
Push-Location $projectRoot
try {
    docker compose up -d db redis zookeeper kafka elasticsearch
} catch {
    Write-Host "Failed to start infra via docker compose: $($_.Exception.Message)" -ForegroundColor Red
    throw
} finally { Pop-Location }

Write-Section "Start backend container"
Push-Location $projectRoot
try {
    docker compose up -d backend
} catch {
    Write-Host "Failed to start backend via docker compose: $($_.Exception.Message)" -ForegroundColor Red
    throw
} finally { Pop-Location }

Write-Section "Check backend health"
if (Invoke-CurlOk 'http://localhost:8080/actuator/health') {
    Write-Host "Backend health OK." -ForegroundColor Green
} elseif (Invoke-CurlOk 'http://localhost:8080/api/health') {
    Write-Host "Backend API health OK." -ForegroundColor Green
} else {
    Write-Host "Backend health endpoint not responding yet. It may still be starting." -ForegroundColor Yellow
}

if (-not $SkipFrontend) {
    Write-Section "Frontend install, build, test"
    Push-Location (Join-Path $projectRoot 'frontend')
    try {
        npm ci --legacy-peer-deps --no-audit --no-fund
        npm run build
        npm run test --silent
    } finally { Pop-Location }
}

if (-not $SkipProd) {
    Write-Section "Start prod-style stack (nginx)"
    Push-Location $projectRoot
    try {
        docker compose -f docker-compose.prod.yml up -d
    } finally { Pop-Location }
}

Write-Host "\nAll done." -ForegroundColor Green


