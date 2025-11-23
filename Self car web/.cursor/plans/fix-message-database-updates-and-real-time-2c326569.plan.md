<!-- 2c326569-4457-4586-9a1d-7d27667e6a67 2e6750e1-0f46-436c-b905-b5ebf7a19fb2 -->
# Fix Message Database Updates and Real-time Updates

## Problem Analysis

1. **Conversation `updatedAt` not updating**: When messages are sent, only the message is saved, but the conversation entity isn't saved, so `@LastModifiedDate` doesn't trigger
2. **No real-time updates**: No WebSocket or SSE mechanism for pushing updates to clients
3. **No message controller**: ChatService exists but no REST endpoints exposed
4. **No logout cleanup**: Conversation timestamps don't update when users logout

## Implementation Plan

### 1. Fix Conversation Update Issue

**File**: `backend/src/main/java/com/selfcar/service/car/ChatService.java`

- Modify `sendMessage()` to explicitly save the conversation after adding a message
- This ensures `updatedAt` timestamp is updated via `@LastModifiedDate`
- Also update conversation when messages are marked as read

### 2. Create Chat/Message Controller

**New File**: `backend/src/main/java/com/selfcar/controller/common/ChatController.java`

- Expose REST endpoints for:
- `POST /api/messages` - Send message
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/{id}/messages` - Get conversation messages
- `PUT /api/messages/{id}/read` - Mark message as read
- `PUT /api/conversations/{id}/read-all` - Mark all messages in conversation as read

### 3. Add Real-time Updates with Server-Sent Events (SSE)

**New File**: `backend/src/main/java/com/selfcar/service/common/RealtimeMessageService.java`

- Implement SSE endpoint for real-time message updates
- Broadcast message events to connected clients
- Track user connections by conversation

**New File**: `backend/src/main/java/com/selfcar/controller/common/RealtimeMessageController.java`

- `GET /api/messages/stream/{conversationId}` - SSE endpoint for real-time updates
- Handle connection management and cleanup

### 4. Update Logout Handler

**File**: `backend/src/main/java/com/selfcar/controller/auth/AuthController.java`

- In `logout()` method, add logic to:
- Update all conversation `updatedAt` timestamps for user's conversations
- Mark user as offline in real-time service
- Close SSE connections for the user

### 5. Enhance ChatService Methods

**File**: `backend/src/main/java/com/selfcar/service/car/ChatService.java`

- Add method to update conversation timestamp explicitly
- Add method to get user conversations
- Add method to mark all messages in conversation as read
- Ensure all methods properly save conversation entity

### 6. Add Repository Methods

**File**: `backend/src/main/java/com/selfcar/repository/common/MessageConversationRepository.java`

- Add query methods:
- `findByParticipantUserId(Long userId)` - Get conversations for user
- `findByParticipantUserIdAndUpdatedAtAfter(...)` - Get recent conversations

**File**: `backend/src/main/java/com/selfcar/repository/common/ChatMessageRepository.java`

- Add query methods:
- `findByConversationIdAndReadFalse(Long conversationId)` - Get unread messages
- `countByConversationIdAndReadFalseAndSenderIdNot(Long conversationId, Long senderId)` - Count unread

### 7. Frontend Integration (Optional)

**File**: `frontend/src/services/api.js`

- Add API methods for chat endpoints
- Add EventSource connection for SSE updates

## Key Changes Summary

- Fix conversation `updatedAt` by explicitly saving conversation entity
- Create REST API endpoints for messaging
- Implement SSE for real-time updates
- Update logout to handle conversation cleanup
- Add proper repository queries for efficient data access

### To-dos

- [x] Fix ChatService to explicitly save conversation entity after adding messages to update updatedAt timestamp
- [x] Create ChatController with REST endpoints for sending messages, getting conversations, and marking messages as read
- [x] Create RealtimeMessageService and RealtimeMessageController for SSE-based real-time updates
- [ ] Update AuthController logout method to update conversation timestamps and close SSE connections
- [ ] Add repository query methods for efficient conversation and message queries
- [ ] Enhance ChatService with methods for getting user conversations and marking all messages as read