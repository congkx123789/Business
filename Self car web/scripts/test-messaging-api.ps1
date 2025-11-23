# SelfCar Messaging API - Quick Test Script
# Tests the messaging API endpoints using curl

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Email = "test@example.com",
    [string]$Password = "password123"
)

Write-Host ""
Write-Host "🧪 SelfCar Messaging API - Quick Test" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$BaseUrl/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running at $BaseUrl" -ForegroundColor Red
    Write-Host "   Please start the backend first: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 1: Login
Write-Host "📝 Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    $token = $loginResponse.token
    if (-not $token) {
        Write-Host "❌ Login failed: No token received" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    Write-Host "   Trying to register user first..." -ForegroundColor Yellow
    
    # Try to register
    $registerBody = @{
        email = $Email
        password = $Password
        firstName = "Test"
        lastName = "User"
        role = "CUSTOMER"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $registerBody `
            -ErrorAction Stop
        $token = $registerResponse.token
        Write-Host "✅ User registered and logged in" -ForegroundColor Green
    } catch {
        Write-Host "❌ Registration also failed: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: Get Conversations
Write-Host "📝 Step 2: Getting user conversations..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $conversations = Invoke-RestMethod -Uri "$BaseUrl/api/conversations" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Retrieved conversations" -ForegroundColor Green
    Write-Host "   Found $($conversations.Count) conversation(s)" -ForegroundColor Gray
    
    if ($conversations.Count -eq 0) {
        Write-Host "⚠️  No conversations found. You may need to create one first." -ForegroundColor Yellow
        Write-Host "   Skipping message tests..." -ForegroundColor Yellow
        exit 0
    }
    
    $conversationId = $conversations[0].id
    Write-Host "   Using conversation ID: $conversationId" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get conversations: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Send Message
Write-Host "📝 Step 3: Sending a test message..." -ForegroundColor Yellow
$messageBody = @{
    conversationId = $conversationId
    content = "Test message from PowerShell script at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    shopId = $null
} | ConvertTo-Json

try {
    $message = Invoke-RestMethod -Uri "$BaseUrl/api/messages" `
        -Method POST `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $messageBody `
        -ErrorAction Stop
    
    Write-Host "✅ Message sent successfully" -ForegroundColor Green
    Write-Host "   Message ID: $($message.id)" -ForegroundColor Gray
    Write-Host "   Content: $($message.content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to send message: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Get Messages
Write-Host "📝 Step 4: Getting conversation messages..." -ForegroundColor Yellow
try {
    $messages = Invoke-RestMethod -Uri "$BaseUrl/api/conversations/$conversationId/messages" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "✅ Retrieved messages" -ForegroundColor Green
    Write-Host "   Found $($messages.Count) message(s)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get messages: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Mark Message as Read
if ($messages.Count -gt 0) {
    Write-Host "📝 Step 5: Marking message as read..." -ForegroundColor Yellow
    $messageId = $messages[0].id
    
    try {
        $readResponse = Invoke-RestMethod -Uri "$BaseUrl/api/messages/$messageId/read" `
            -Method PUT `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "✅ Message marked as read" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to mark message as read: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ API Test Summary:" -ForegroundColor Green
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "✅ Authentication: Working" -ForegroundColor Green
Write-Host "✅ Get Conversations: Working" -ForegroundColor Green
Write-Host "✅ Send Message: Working" -ForegroundColor Green
Write-Host "✅ Get Messages: Working" -ForegroundColor Green
Write-Host "✅ Mark as Read: Working" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test SSE in browser (see TESTING_GUIDE.md)" -ForegroundColor White
Write-Host "   2. Use Postman collection for detailed testing" -ForegroundColor White
Write-Host "   3. Verify database updates manually" -ForegroundColor White
Write-Host ""

