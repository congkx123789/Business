# SelfCar Messaging System - Complete Testing Guide

This guide provides comprehensive testing instructions for the SelfCar messaging system, including backend tests, Postman collection, and integration testing.

## Table of Contents

1. [Backend Unit Tests](#backend-unit-tests)
2. [Backend Integration Tests](#backend-integration-tests)
3. [Postman Collection Testing](#postman-collection-testing)
4. [Real-time SSE Testing](#real-time-sse-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Verification Checklist](#verification-checklist)

## Backend Unit Tests

### Running Tests

```bash
cd backend
mvn test
```

### Test Coverage

The following test files verify messaging functionality:

1. **ChatServiceTest.java** - Tests service layer
   - `sendMessage()` - Verifies message creation and conversation update
   - `markMessageAsRead()` - Verifies read status update
   - `getUserConversations()` - Verifies conversation retrieval
   - `markAllMessagesAsRead()` - Verifies bulk read operations
   - `updateConversationTimestamp()` - Verifies timestamp updates

2. **ChatControllerTest.java** - Tests REST endpoints
   - `sendMessage()` - Tests POST /api/messages
   - `getUserConversations()` - Tests GET /api/conversations
   - `getConversationMessages()` - Tests GET /api/conversations/{id}/messages
   - `markMessageAsRead()` - Tests PUT /api/messages/{id}/read
   - `markAllMessagesAsRead()` - Tests PUT /api/conversations/{id}/read-all

3. **MessagingIntegrationTest.java** - Integration tests
   - Database persistence verification
   - Timestamp update verification
   - Conversation retrieval verification

### Expected Test Results

All tests should pass with:
- ✅ Message creation updates conversation timestamp
- ✅ Marking messages as read updates conversation timestamp
- ✅ User conversations are retrieved correctly
- ✅ All messages in conversation can be marked as read
- ✅ Database updates are persisted correctly

## Backend Integration Tests

### Running Integration Tests

```bash
cd backend
mvn test -Dtest=MessagingIntegrationTest
```

### Test Scenarios

1. **Send Message Updates Conversation Timestamp**
   - Sends a message
   - Verifies conversation `updatedAt` timestamp is updated
   - Verifies message is persisted in database

2. **Get User Conversations**
   - Creates conversation with participants
   - Retrieves conversations for user
   - Verifies correct conversations are returned

3. **Mark Message as Read Updates Timestamp**
   - Sends message
   - Marks message as read
   - Verifies conversation timestamp is updated

4. **Mark All Messages as Read**
   - Sends multiple messages
   - Marks all messages as read
   - Verifies all messages are marked correctly

## Postman Collection Testing

### Setup

1. **Import Collection**
   - Open Postman
   - Import `postman/SelfCar_Messaging_API.postman_collection.json`
   - See `postman/README.md` for detailed instructions

2. **Configure Environment**
   - Set `base_url` to `http://localhost:8080`
   - Other variables are auto-set during testing

3. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### Testing Workflow

#### Step 1: Authentication
1. Run **Register User** or **Login**
2. Verify `access_token` and `refresh_token` are set in environment
3. Run **Get Current User** to verify authentication

#### Step 2: Conversations
1. Run **Get User Conversations**
2. Verify response contains conversation list
3. Verify `conversation_id` is auto-set in environment

#### Step 3: Messages
1. Run **Send Message**
   - Verify status code is 200
   - Verify response contains message with ID
   - Verify `message_id` is auto-set
2. Run **Get Conversation Messages**
   - Verify all messages are returned
   - Verify new message is in the list

#### Step 4: Read Status
1. Run **Mark Message as Read**
   - Verify status code is 200
   - Verify success message
2. Run **Mark All Messages as Read**
   - Verify status code is 200
   - Verify success message

#### Step 5: Logout
1. Run **Logout**
   - Verify status code is 200
   - Verify success message
   - Verify SSE connections are closed

### Expected Responses

#### Success Responses
```json
// Send Message
{
  "id": 1,
  "content": "Hello, this is a test message!",
  "read": false,
  "createdAt": "2025-01-08T12:00:00",
  "sender": { ... },
  "conversation": { ... }
}

// Get Conversations
[
  {
    "id": 1,
    "createdAt": "2025-01-08T10:00:00",
    "updatedAt": "2025-01-08T12:00:00",
    "participants": [ ... ],
    "messages": [ ... ]
  }
]

// Mark as Read
{
  "success": true,
  "message": "Message marked as read"
}
```

## Real-time SSE Testing

### Browser Testing

1. **Open Browser Console** (F12)
2. **Run this JavaScript:**

```javascript
// Get token from Postman or login
const token = 'YOUR_ACCESS_TOKEN';
const conversationId = 1; // Use actual conversation ID

// Create EventSource connection
const eventSource = new EventSource(
  `http://localhost:8080/api/messages/stream/${conversationId}`,
  { withCredentials: true }
);

// Listen for new messages
eventSource.addEventListener('new_message', (event) => {
  const message = JSON.parse(event.data);
  console.log('📨 New message received:', message);
});

// Listen for conversation updates
eventSource.addEventListener('conversation_updated', (event) => {
  const conversation = JSON.parse(event.data);
  console.log('🔄 Conversation updated:', conversation);
});

// Listen for connection
eventSource.addEventListener('connected', (event) => {
  console.log('✅ Connected:', event.data);
});

// Handle errors
eventSource.onerror = (error) => {
  console.error('❌ SSE Error:', error);
};

// Close connection when done
// eventSource.close();
```

3. **Send a message from Postman** while SSE is connected
4. **Verify** you see the `new_message` event in console

### curl Testing

```bash
# Get your access token first
TOKEN="your_access_token_here"
CONVERSATION_ID=1

# Connect to SSE stream
curl -N -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/messages/stream/$CONVERSATION_ID
```

### Expected SSE Events

```
event: connected
data: Connected to conversation 1

event: new_message
data: {"id":1,"content":"Hello","read":false,...}

event: conversation_updated
data: {"id":1,"updatedAt":"2025-01-08T12:00:00",...}
```

## End-to-End Testing

### Complete Flow Test

1. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **User 1: Login and Connect**
   - Login via Postman
   - Get conversations
   - Connect to SSE stream (browser console)

3. **User 2: Login and Send Message**
   - Login via Postman (different user)
   - Send message to same conversation

4. **Verify Real-time Update**
   - User 1 should receive `new_message` event in browser console
   - User 1 should see conversation update

5. **Verify Database Updates**
   - Check database: `SELECT * FROM conversations WHERE id = ?`
   - Verify `updated_at` timestamp is current
   - Verify message is in `messages` table

6. **Mark Messages as Read**
   - User 1 marks message as read
   - Verify `is_read = true` in database
   - Verify conversation `updated_at` is updated

7. **Logout**
   - User 1 logs out
   - Verify SSE connection closes
   - Verify conversation timestamps are updated

## Verification Checklist

### Database Updates ✅

- [ ] Conversation `updated_at` updates when message is sent
- [ ] Conversation `updated_at` updates when message is marked as read
- [ ] Conversation `updated_at` updates on logout
- [ ] Message `is_read` updates correctly
- [ ] All changes are persisted to database

### REST API Endpoints ✅

- [ ] `POST /api/messages` - Creates message and updates conversation
- [ ] `GET /api/conversations` - Returns user conversations
- [ ] `GET /api/conversations/{id}/messages` - Returns conversation messages
- [ ] `PUT /api/messages/{id}/read` - Marks message as read
- [ ] `PUT /api/conversations/{id}/read-all` - Marks all messages as read
- [ ] All endpoints require authentication
- [ ] All endpoints return correct status codes

### Real-time Updates ✅

- [ ] SSE connection establishes successfully
- [ ] `new_message` events are broadcast correctly
- [ ] `conversation_updated` events are broadcast correctly
- [ ] Multiple clients can connect to same conversation
- [ ] SSE connections close on logout
- [ ] Error handling works correctly

### Integration ✅

- [ ] Frontend `chatAPI` methods work correctly
- [ ] Frontend `createMessageStream()` works correctly
- [ ] Backend and frontend communicate properly
- [ ] CORS is configured correctly
- [ ] Authentication flows work end-to-end

## Troubleshooting

### Tests Fail

**Issue**: Tests fail with database errors
- **Solution**: Ensure test database is configured correctly
- Check `application-test.properties` exists
- Verify H2 database is available for tests

**Issue**: Tests fail with authentication errors
- **Solution**: Mock authentication properly in tests
- Use `@WithMockUser` or mock `UserPrincipal`

### Postman Issues

**Issue**: 401 Unauthorized errors
- **Solution**: Run Login request first
- Verify token is saved in environment
- Check token hasn't expired

**Issue**: Variables not auto-setting
- **Solution**: Check test scripts in Postman collection
- Verify environment is selected
- Manually set variables if needed

### SSE Issues

**Issue**: SSE connection fails
- **Solution**: Check backend is running
- Verify CORS allows your origin
- Check authentication token is valid
- Use browser DevTools to see connection errors

**Issue**: No events received
- **Solution**: Verify conversation ID is correct
- Send a message while connected
- Check backend logs for broadcast errors

### Database Update Issues

**Issue**: `updated_at` not updating
- **Solution**: Verify `@LastModifiedDate` is on entity
- Check `@EntityListeners(AuditingEntityListener.class)` is present
- Ensure `conversationRepository.save()` is called
- Check database logs for UPDATE queries

## Performance Testing

### Load Testing

Use tools like Apache JMeter or k6 to test:

1. **Concurrent Message Sending**
   - Send 100 messages concurrently
   - Verify all are saved
   - Verify conversation timestamps update

2. **Multiple SSE Connections**
   - Connect 50 clients to same conversation
   - Send message
   - Verify all clients receive update

3. **Database Performance**
   - Monitor query execution time
   - Check for N+1 query problems
   - Verify indexes are used

## Security Testing

### Authentication & Authorization

- [ ] Unauthenticated requests are rejected
- [ ] Users can only access their own conversations
- [ ] Users can only mark their own messages as read
- [ ] SSE connections require authentication
- [ ] Tokens expire correctly

### Input Validation

- [ ] Empty messages are rejected
- [ ] Very long messages are handled
- [ ] Invalid conversation IDs return 404
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized

## Next Steps

1. ✅ Run all unit tests
2. ✅ Run integration tests
3. ✅ Test with Postman collection
4. ✅ Test SSE in browser
5. ✅ Verify database updates
6. ✅ Test complete user flow
7. ✅ Check performance under load
8. ✅ Verify security measures

## Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Check browser console for frontend errors
- Review Postman console for API errors
- Check database directly for data verification
