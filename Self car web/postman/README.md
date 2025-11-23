# SelfCar Messaging API - Postman Collection

This Postman collection provides comprehensive testing for the SelfCar messaging API, including real-time updates via Server-Sent Events (SSE).

## Setup

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `SelfCar_Messaging_API.postman_collection.json`
4. The collection will be imported with all endpoints

### 2. Configure Environment Variables

Create a new Postman Environment or use the default one with these variables:

- `base_url`: `http://localhost:8080` (or your backend URL)
- `access_token`: (auto-set after login)
- `refresh_token`: (auto-set after login)
- `user_id`: (auto-set after login)
- `conversation_id`: (auto-set when getting conversations)
- `message_id`: (auto-set when sending messages)

### 3. Start Backend Server

Make sure your backend is running:
```bash
cd backend
mvn spring-boot:run
```

## Testing Workflow

### Step 1: Authentication
1. **Register User** - Create a new user account
   - Or use **Login** if user already exists
   - Tokens are automatically saved to environment variables

### Step 2: Get Conversations
1. **Get User Conversations** - Retrieve all conversations for the authenticated user
   - The first conversation ID is automatically saved

### Step 3: Send Messages
1. **Send Message** - Send a new message to a conversation
   - Message ID is automatically saved
2. **Get Conversation Messages** - View all messages in a conversation

### Step 4: Mark Messages as Read
1. **Mark Message as Read** - Mark a specific message as read
2. **Mark All Messages as Read** - Mark all messages in a conversation as read

### Step 5: Real-time Updates (SSE)
1. **Subscribe to Message Stream** - Connect to SSE endpoint for real-time updates
   - Note: Postman shows the connection, but for full functionality use a browser or EventSource client
   - The stream will receive `new_message` and `conversation_updated` events

### Step 6: Logout
1. **Logout** - Logs out the user and closes SSE connections
   - Updates conversation timestamps
   - Closes all active SSE connections

## Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Conversations
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/{id}/messages` - Get conversation messages

### Messages
- `POST /api/messages` - Send message
- `PUT /api/messages/{id}/read` - Mark message as read
- `PUT /api/conversations/{id}/read-all` - Mark all messages as read

### Real-time
- `GET /api/messages/stream/{conversationId}` - SSE endpoint for real-time updates

## Testing Real-time Updates

For testing SSE endpoints, you have several options:

### Option 1: Browser Console
```javascript
const eventSource = new EventSource('http://localhost:8080/api/messages/stream/1', {
  withCredentials: true
});

eventSource.addEventListener('new_message', (event) => {
  console.log('New message:', JSON.parse(event.data));
});

eventSource.addEventListener('conversation_updated', (event) => {
  console.log('Conversation updated:', JSON.parse(event.data));
});
```

### Option 2: curl
```bash
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/messages/stream/1
```

### Option 3: Postman
- Postman can show the connection, but SSE streaming works best in browsers or dedicated SSE clients

## Expected Responses

### Success Responses
- **200 OK** - Successful request
- **201 Created** - Resource created successfully

### Error Responses
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid authentication
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## Test Scenarios

### Scenario 1: Complete Message Flow
1. Login
2. Get conversations
3. Send message
4. Get conversation messages
5. Mark message as read
6. Logout

### Scenario 2: Real-time Updates
1. Login
2. Get conversations
3. Subscribe to message stream (in browser/SSE client)
4. Send message (from Postman or another client)
5. Verify real-time update received
6. Logout

### Scenario 3: Bulk Operations
1. Login
2. Get conversations
3. Send multiple messages
4. Mark all messages as read
5. Verify conversation updated timestamp
6. Logout

## Troubleshooting

### Authentication Issues
- Ensure tokens are being saved after login
- Check token expiration (default: 15 minutes)
- Use refresh token if access token expired

### SSE Connection Issues
- Ensure backend is running
- Check CORS configuration
- Verify authentication token is valid
- Use browser DevTools to check SSE connection

### Database Update Issues
- Verify conversation `updatedAt` timestamp updates after sending messages
- Check database logs for update queries
- Ensure `@LastModifiedDate` is working correctly

## Notes

- All endpoints require authentication except `/api/health`
- Tokens are automatically managed by the collection
- Environment variables are automatically set during test execution
- SSE endpoint requires persistent connection (use browser or SSE client for full testing)
