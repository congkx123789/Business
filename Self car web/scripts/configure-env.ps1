# Configure Environment Variables Script
# Helps set up environment variables for image optimization

param(
    [string]$Environment = "dev",
    [switch]$Interactive = $false
)

$ErrorActionPreference = "Stop"

Write-Host "Configuring Environment Variables for Image Optimization" -ForegroundColor Green
Write-Host ""

# Get CloudFront domain
if ($Interactive) {
    $cloudfrontDomain = Read-Host "Enter CloudFront domain (e.g., d1234567890.cloudfront.net)"
    $s3BucketName = Read-Host "Enter S3 bucket name (e.g., selfcar-images-prod)"
    $awsRegion = Read-Host "Enter AWS region (default: us-east-1)" -DefaultValue "us-east-1"
    $awsAccessKey = Read-Host "Enter AWS Access Key ID (or press Enter to skip)"
    $awsSecretKey = Read-Host "Enter AWS Secret Access Key (or press Enter to skip)" -AsSecureString
} else {
    $cloudfrontDomain = $env:AWS_CDN_DOMAIN
    $s3BucketName = $env:AWS_S3_BUCKET_NAME
    $awsRegion = $env:AWS_REGION
    $awsAccessKey = $env:AWS_ACCESS_KEY_ID
}

if ([string]::IsNullOrEmpty($cloudfrontDomain)) {
    Write-Host "Error: CloudFront domain is required" -ForegroundColor Red
    Write-Host "Set AWS_CDN_DOMAIN environment variable or run with -Interactive" -ForegroundColor Yellow
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Environment: $Environment"
Write-Host "  CloudFront Domain: $cloudfrontDomain"
Write-Host "  S3 Bucket: $s3BucketName"
Write-Host "  AWS Region: $awsRegion"
Write-Host ""

# Backend configuration
$backendConfigPath = "backend/src/main/resources/application-$Environment.properties"
if (-not (Test-Path $backendConfigPath)) {
    Write-Host "Creating $backendConfigPath..." -ForegroundColor Yellow
    $null = New-Item -Path $backendConfigPath -ItemType File -Force
}

Write-Host "Updating backend configuration..." -ForegroundColor Yellow
$backendConfig = @"
# AWS S3 Configuration for Image Storage
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
aws.s3.bucket-name=$s3BucketName
aws.s3.region=$awsRegion
aws.s3.cdn-domain=$cloudfrontDomain

# Image CDN Configuration
image.cdn.enabled=true
image.cdn.base-url=https://$cloudfrontDomain
"@

Add-Content -Path $backendConfigPath -Value $backendConfig -Force
Write-Host "✓ Backend configuration updated" -ForegroundColor Green

# Frontend configuration
$frontendEnvPath = "frontend/.env.$Environment"
if (-not (Test-Path $frontendEnvPath)) {
    Write-Host "Creating $frontendEnvPath..." -ForegroundColor Yellow
    $null = New-Item -Path $frontendEnvPath -ItemType File -Force
}

Write-Host "Updating frontend configuration..." -ForegroundColor Yellow
$frontendConfig = @"
# Image CDN Configuration
VITE_CDN_ENABLED=true
VITE_CDN_BASE_URL=https://$cloudfrontDomain
"@

Add-Content -Path $frontendEnvPath -Value $frontendConfig -Force
Write-Host "✓ Frontend configuration updated" -ForegroundColor Green

Write-Host ""
Write-Host "Configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Set AWS credentials as environment variables:"
Write-Host "   `$env:AWS_ACCESS_KEY_ID = 'your-key'"
Write-Host "   `$env:AWS_SECRET_ACCESS_KEY = 'your-secret'"
Write-Host "2. Restart backend and frontend services"
Write-Host "3. Test image upload"
Write-Host ""

