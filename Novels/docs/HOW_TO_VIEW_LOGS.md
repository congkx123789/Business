# How to View and Analyze Service Logs

This guide shows you how to view all the captured terminal output from your services.

## Quick Start

After running `pnpm restart:all`, all service output is saved in the `logs/` directory.

## View Logs

### 1. View Complete Log from One Service

View everything that service wrote to the terminal:

```powershell
Get-Content logs\users-service.log
```

Or for any service:
```powershell
Get-Content logs\gateway.log
Get-Content logs\websocket-service.log
Get-Content logs\stories-service.log
```

### 2. View Last 100 Lines (Most Recent Output)

```powershell
Get-Content logs\users-service.log -Tail 100
```

### 3. View Only Errors from a Service

```powershell
Get-Content logs\websocket-service.log | Select-String -Pattern 'error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION' -CaseSensitive:$false
```

### 4. View All Logs from All Services

See everything from all services at once:

```powershell
Get-ChildItem logs\*.log | ForEach-Object { 
    Write-Host "`n`n========================================`n=== $($_.Name) ===`n========================================`n"
    Get-Content $_.FullName 
}
```

### 5. View All Errors from All Services

Find all errors across all services:

```powershell
Get-ChildItem logs\*.log | ForEach-Object { 
    Write-Host "`n=== $($_.Name) ==="
    Get-Content $_.FullName | Select-String -Pattern 'error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION' -CaseSensitive:$false 
}
```

### 6. Check Log File Sizes

See which services are most active:

```powershell
Get-ChildItem logs\*.log | Select-Object Name, @{Name='Size(KB)';Expression={[math]::Round($_.Length/1KB,2)}}, LastWriteTime | Format-Table -AutoSize
```

## Search Logs

### Search for Specific Text

```powershell
# Search for "database" in all logs
Get-ChildItem logs\*.log | Select-String -Pattern "database" -CaseSensitive:$false

# Search for "port" in a specific service
Get-Content logs\gateway.log | Select-String -Pattern "port"
```

### Search with Context (show lines before/after)

```powershell
Get-Content logs\websocket-service.log | Select-String -Pattern "error" -Context 5,5
```

## Export Logs

### Save Log to File

```powershell
Get-Content logs\users-service.log > my-log-backup.txt
```

### Save Only Errors to File

```powershell
Get-Content logs\websocket-service.log | Select-String -Pattern 'error|Error|ERROR' > errors-only.txt
```

## Real-Time Monitoring

### Watch a Log File in Real-Time (like `tail -f`)

```powershell
Get-Content logs\gateway.log -Wait -Tail 50
```

Press `Ctrl+C` to stop watching.

## Common Use Cases

### 1. Find Why a Service Failed

```powershell
# View the last 50 lines
Get-Content logs\websocket-service.log -Tail 50

# Or search for errors
Get-Content logs\websocket-service.log | Select-String -Pattern 'error|Error|ERROR|failed|Failed|FAILED' -CaseSensitive:$false
```

### 2. Check Service Startup Time

```powershell
# Look for "Starting" messages
Get-Content logs\users-service.log | Select-String -Pattern "Starting"
```

### 3. Find Database Connection Issues

```powershell
Get-ChildItem logs\*.log | Select-String -Pattern "database|Database|connection|Connection|connect|Connect" -CaseSensitive:$false
```

### 4. Check API Requests

```powershell
Get-Content logs\gateway.log | Select-String -Pattern "GET|POST|PUT|DELETE|request|Request"
```

## Tips

1. **Use `-Tail` for recent output**: Most issues are in the last 50-100 lines
2. **Search is case-insensitive**: The patterns work regardless of case
3. **Combine commands**: You can pipe multiple commands together
4. **Logs are timestamped**: Each line has a timestamp for easy tracking
5. **Logs grow over time**: Use `-Tail` to avoid loading huge files

## Example Workflow

```powershell
# 1. Check which services have logs
Get-ChildItem logs\*.log

# 2. Check log sizes (see which is most active)
Get-ChildItem logs\*.log | Select-Object Name, @{Name='Size(KB)';Expression={[math]::Round($_.Length/1KB,2)}} | Format-Table

# 3. View errors from a specific service
Get-Content logs\websocket-service.log | Select-String -Pattern 'error|Error|ERROR' -CaseSensitive:$false

# 4. View last 50 lines to see recent activity
Get-Content logs\websocket-service.log -Tail 50

# 5. Watch in real-time
Get-Content logs\gateway.log -Wait -Tail 50
```

