Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 15

$maxAttempts = 6
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Attempt $attempt/$maxAttempts : Checking http://localhost:8080/api/health..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "SUCCESS! Backend is running."
        Write-Host "Response:"
        Write-Host $response.Content
        exit 0
    } catch {
        Write-Host "Not ready yet: $($_.Exception.Message)"
        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 5
        } else {
            Write-Host "Backend failed to start after multiple attempts."
            exit 1
        }
    }
}

