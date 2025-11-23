# Monitor Performance Metrics Script
# Queries and displays performance metrics

param(
    [string]$ApiBaseUrl = "http://localhost:8080",
    [switch]$Continuous = $false,
    [int]$IntervalSeconds = 30
)

$ErrorActionPreference = "Stop"

function Get-Metrics {
    param([string]$BaseUrl)
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/metrics/performance/baseline" -Method Get
        return $response
    } catch {
        Write-Host "Error fetching metrics: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Display-Metrics {
    param($metrics)
    
    Clear-Host
    Write-Host "Performance Metrics - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Write-Host "=" * 60
    Write-Host ""
    
    if ($null -eq $metrics -or $metrics.Count -eq 0) {
        Write-Host "No metrics available yet" -ForegroundColor Yellow
        Write-Host "Metrics will appear after frontend starts collecting data"
        return
    }
    
    foreach ($metricName in $metrics.Keys) {
        $metric = $metrics[$metricName]
        Write-Host $metricName -ForegroundColor Cyan
        Write-Host "  Count:     $($metric.count)"
        Write-Host "  Average:   $([math]::Round($metric.avg, 2))"
        Write-Host "  Min:       $([math]::Round($metric.min, 2))"
        Write-Host "  Max:       $([math]::Round($metric.max, 2))"
        Write-Host "  p95:       $([math]::Round($metric.p95, 2))"
        Write-Host ""
    }
    
    Write-Host "=" * 60
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
}

Write-Host "Performance Metrics Monitor" -ForegroundColor Green
Write-Host "API Base URL: $ApiBaseUrl"
Write-Host ""

if ($Continuous) {
    Write-Host "Monitoring mode (updates every $IntervalSeconds seconds)" -ForegroundColor Yellow
    Write-Host ""
    
    while ($true) {
        $metrics = Get-Metrics -BaseUrl $ApiBaseUrl
        Display-Metrics -metrics $metrics
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    $metrics = Get-Metrics -BaseUrl $ApiBaseUrl
    Display-Metrics -metrics $metrics
}

