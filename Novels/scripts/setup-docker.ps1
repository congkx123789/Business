# Docker Setup Script for Windows
# This script helps install and configure Docker Desktop

Write-Host "=== Docker Desktop Setup Guide ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is already installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerInstalled) {
    Write-Host "✓ Docker is already installed!" -ForegroundColor Green
    docker --version
    Write-Host ""
    Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
    docker compose up -d
    exit 0
}

Write-Host "Docker Desktop is not installed." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please follow these steps to install Docker Desktop:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Download Docker Desktop for Windows:" -ForegroundColor White
Write-Host "   https://www.docker.com/products/docker-desktop/" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Run the installer (Docker Desktop Installer.exe)" -ForegroundColor White
Write-Host ""
Write-Host "3. After installation, restart your computer" -ForegroundColor White
Write-Host ""
Write-Host "4. Start Docker Desktop from the Start menu" -ForegroundColor White
Write-Host ""
Write-Host "5. Wait for Docker Desktop to fully start (whale icon in system tray)" -ForegroundColor White
Write-Host ""
Write-Host "6. Then run this command to start infrastructure:" -ForegroundColor White
Write-Host "   docker compose up -d" -ForegroundColor Green
Write-Host ""
Write-Host "Alternative: Use WSL 2 backend (recommended for better performance)" -ForegroundColor Yellow
Write-Host "   - Install WSL 2: wsl --install" -ForegroundColor White
Write-Host "   - Docker Desktop will use WSL 2 automatically" -ForegroundColor White
Write-Host ""

# Check if WSL is available
$wslAvailable = Get-Command wsl -ErrorAction SilentlyContinue
if ($wslAvailable) {
    Write-Host "WSL is available. Checking WSL status..." -ForegroundColor Cyan
    wsl --status
} else {
    Write-Host "WSL is not installed. You can install it for better Docker performance:" -ForegroundColor Yellow
    Write-Host "   wsl --install" -ForegroundColor Green
}

Write-Host ""
Write-Host "After Docker Desktop is installed and running, execute:" -ForegroundColor Cyan
Write-Host "   docker compose up -d" -ForegroundColor Green

