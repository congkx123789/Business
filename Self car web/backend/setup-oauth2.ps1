# OAuth2 Environment Variables Setup Script
# This script helps you set OAuth2 credentials for local development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OAuth2 Environment Variables Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Write-Host "Found .env file. Loading existing values..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Write-Host "Enter your OAuth2 credentials (press Enter to skip):" -ForegroundColor Green
Write-Host ""

# Google OAuth2
$googleId = [System.Environment]::GetEnvironmentVariable("GOOGLE_CLIENT_ID", "Process")
$googleSecret = [System.Environment]::GetEnvironmentVariable("GOOGLE_CLIENT_SECRET", "Process")

if (-not $googleId) {
    $googleId = Read-Host "Google Client ID"
}
if (-not $googleSecret) {
    $googleSecret = Read-Host "Google Client Secret"
}

# GitHub OAuth2
$githubId = [System.Environment]::GetEnvironmentVariable("GITHUB_CLIENT_ID", "Process")
$githubSecret = [System.Environment]::GetEnvironmentVariable("GITHUB_CLIENT_SECRET", "Process")

if (-not $githubId) {
    $githubId = Read-Host "GitHub Client ID"
}
if (-not $githubSecret) {
    $githubSecret = Read-Host "GitHub Client Secret"
}

# Facebook OAuth2
$facebookId = [System.Environment]::GetEnvironmentVariable("FACEBOOK_CLIENT_ID", "Process")
$facebookSecret = [System.Environment]::GetEnvironmentVariable("FACEBOOK_CLIENT_SECRET", "Process")

if (-not $facebookId) {
    $facebookId = Read-Host "Facebook App ID"
}
if (-not $facebookSecret) {
    $facebookSecret = Read-Host "Facebook App Secret"
}

# Set environment variables for current session
if ($googleId) {
    [System.Environment]::SetEnvironmentVariable("GOOGLE_CLIENT_ID", $googleId, "Process")
    Write-Host "✓ Google Client ID set" -ForegroundColor Green
}
if ($googleSecret) {
    [System.Environment]::SetEnvironmentVariable("GOOGLE_CLIENT_SECRET", $googleSecret, "Process")
    Write-Host "✓ Google Client Secret set" -ForegroundColor Green
}

if ($githubId) {
    [System.Environment]::SetEnvironmentVariable("GITHUB_CLIENT_ID", $githubId, "Process")
    Write-Host "✓ GitHub Client ID set" -ForegroundColor Green
}
if ($githubSecret) {
    [System.Environment]::SetEnvironmentVariable("GITHUB_CLIENT_SECRET", $githubSecret, "Process")
    Write-Host "✓ GitHub Client Secret set" -ForegroundColor Green
}

if ($facebookId) {
    [System.Environment]::SetEnvironmentVariable("FACEBOOK_CLIENT_ID", $facebookId, "Process")
    Write-Host "✓ Facebook App ID set" -ForegroundColor Green
}
if ($facebookSecret) {
    [System.Environment]::SetEnvironmentVariable("FACEBOOK_CLIENT_SECRET", $facebookSecret, "Process")
    Write-Host "✓ Facebook App Secret set" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment variables set for this session" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To make these permanent, add them to your system environment variables" -ForegroundColor Yellow
Write-Host "or create a .env file in the backend directory with:" -ForegroundColor Yellow
Write-Host ""
Write-Host "GOOGLE_CLIENT_ID=your-google-client-id" -ForegroundColor Gray
Write-Host "GOOGLE_CLIENT_SECRET=your-google-client-secret" -ForegroundColor Gray
Write-Host "GITHUB_CLIENT_ID=your-github-client-id" -ForegroundColor Gray
Write-Host "GITHUB_CLIENT_SECRET=your-github-client-secret" -ForegroundColor Gray
Write-Host "FACEBOOK_CLIENT_ID=your-facebook-app-id" -ForegroundColor Gray
Write-Host "FACEBOOK_CLIENT_SECRET=your-facebook-app-secret" -ForegroundColor Gray
Write-Host ""
Write-Host "Now you can start the backend with OAuth2 enabled!" -ForegroundColor Green

