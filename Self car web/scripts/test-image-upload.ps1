# Test Image Upload Script
# Tests the image upload functionality locally

param(
    [string]$ApiBaseUrl = "http://localhost:8080/api",
    [string]$Token = "",
    [long]$CarId = 1,
    [string]$ImagePath = "assets/images/test-image.jpg"
)

$ErrorActionPreference = "Stop"

Write-Host "Testing Image Upload" -ForegroundColor Green
Write-Host "API Base URL: $ApiBaseUrl"
Write-Host "Car ID: $CarId"
Write-Host ""

# Check if image file exists
if (-not (Test-Path $ImagePath)) {
    Write-Host "Error: Image file not found: $ImagePath" -ForegroundColor Red
    Write-Host "Please provide a valid image file path" -ForegroundColor Yellow
    exit 1
}

# Check if token is provided
if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "Warning: No token provided. You may need to authenticate first." -ForegroundColor Yellow
    Write-Host "Get token from: POST $ApiBaseUrl/auth/login" -ForegroundColor Yellow
    $Token = Read-Host "Enter JWT token (or press Enter to skip)"
}

# Prepare headers
$headers = @{
    "Content-Type" = "multipart/form-data"
}

if (-not [string]::IsNullOrEmpty($Token)) {
    $headers["Authorization"] = "Bearer $Token"
}

# Upload image
Write-Host "Uploading image..." -ForegroundColor Yellow
try {
    $imageBytes = [System.IO.File]::ReadAllBytes($ImagePath)
    $boundary = [System.Guid]::NewGuid().ToString()
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$(Split-Path $ImagePath -Leaf)`"",
        "Content-Type: image/jpeg",
        "",
        [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes),
        "--$boundary",
        "Content-Disposition: form-data; name=`"carId`"",
        "",
        $CarId.ToString(),
        "--$boundary--"
    )
    
    $body = $bodyLines -join "`r`n"
    $bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body)
    
    $headers["Content-Type"] = "multipart/form-data; boundary=$boundary"
    
    $response = Invoke-RestMethod -Uri "$ApiBaseUrl/car-images/upload" `
        -Method Post `
        -Headers $headers `
        -Body $bodyBytes
    
    Write-Host "Upload successful!" -ForegroundColor Green
    Write-Host "Image URL: $($response.imageUrl)" -ForegroundColor Cyan
    Write-Host "Image ID: $($response.id)" -ForegroundColor Cyan
    
    # Verify CDN URL
    if ($response.imageUrl -match "cloudfront|cdn") {
        Write-Host "✓ Image URL is a CDN URL" -ForegroundColor Green
    } else {
        Write-Host "⚠ Image URL is not a CDN URL" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Error uploading image:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green

