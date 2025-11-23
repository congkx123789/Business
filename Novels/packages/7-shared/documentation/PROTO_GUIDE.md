# Protocol Buffer (gRPC) Guide

## Overview

This guide explains how to define and use Protocol Buffer (`.proto`) files in the `7-shared` package. Proto files define the contracts for gRPC communication between services.

## Location

All `.proto` files are located in:
```
packages/7-shared/src/proto/definitions/
```

Generated TypeScript files are output to:
```
packages/7-shared/src/proto/generated/
```

## Proto File Structure

### Basic Syntax

```protobuf
syntax = "proto3";

package <service-name>;

// Import other proto files if needed
import "google/protobuf/struct.proto";

// Define messages
message MyMessage {
  string id = 1;
  string name = 2;
  int32 count = 3;
  bool isActive = 4;
}

// Define service
service MyService {
  rpc GetMyMessage(GetMyMessageRequest) returns (MyMessage);
  rpc CreateMyMessage(CreateMyMessageRequest) returns (MyMessage);
}
```

### Field Numbering

- **Field numbers are required** and must be unique within a message
- Use sequential numbering (1, 2, 3, ...)
- **Never reuse field numbers** - even if you remove a field, keep the number reserved
- Field numbers 1-15 use 1 byte, 16-2047 use 2 bytes (prefer 1-15 for frequently used fields)

### Field Types

Common types:
- `string` - Text data
- `int32`, `int64` - Integers
- `double`, `float` - Floating point numbers
- `bool` - Boolean
- `bytes` - Binary data
- `repeated` - Arrays/lists
- `optional` - Optional fields (proto3)

### Naming Conventions

- **Messages**: PascalCase (e.g., `GetUserRequest`, `UserResponse`)
- **Fields**: snake_case (e.g., `user_id`, `created_at`)
- **Services**: PascalCase with "Service" suffix (e.g., `UsersService`)

## Creating a New Proto File

### Step 1: Create the Proto File

Create a new file in `src/proto/definitions/`:
```protobuf
syntax = "proto3";

package my-service;

message MyRequest {
  string id = 1;
}

message MyResponse {
  string result = 1;
}

service MyService {
  rpc GetMyData(MyRequest) returns (MyResponse);
}
```

### Step 2: Generate TypeScript

Run the generation script:
```bash
pnpm generate-proto
# or
node build-scripts/generate-proto.ts
```

This will generate TypeScript files in `src/proto/generated/`.

### Step 3: Export Generated Types

Update `src/proto/index.ts` to export the generated types:
```typescript
export * from './generated/my-service.pb';
```

## Best Practices

### 1. Keep Messages Focused

Each message should represent a single concept:
```protobuf
// ✅ Good
message User {
  string id = 1;
  string email = 2;
  string name = 3;
}

// ❌ Bad - mixing concerns
message UserWithStoryAndComments {
  string userId = 1;
  string storyId = 2;
  repeated string commentIds = 3;
}
```

### 2. Use Request/Response Pattern

Always use separate request and response messages:
```protobuf
// ✅ Good
message GetUserRequest {
  string userId = 1;
}

message GetUserResponse {
  User user = 1;
}

// ❌ Bad - using primitive types directly
service UsersService {
  rpc GetUser(string) returns (User);  // Don't do this
}
```

### 3. Handle Optional Fields

Use `optional` for fields that may not be present:
```protobuf
message UpdateUserRequest {
  string userId = 1;
  optional string name = 2;      // May be omitted
  optional string email = 3;     // May be omitted
}
```

### 4. Use Timestamps

For dates/times, use `int64` with Unix timestamps:
```protobuf
message User {
  string id = 1;
  int64 createdAt = 2;  // Unix timestamp in milliseconds
  int64 updatedAt = 3;
}
```

### 5. Reuse Common Messages

If multiple services need the same message, consider creating a shared proto file or importing from another service's proto.

## Service Definition

### RPC Methods

Define RPC methods in your service:
```protobuf
service UsersService {
  // Get a single user
  rpc GetUser(GetUserRequest) returns (User);
  
  // Create a user
  rpc CreateUser(CreateUserRequest) returns (User);
  
  // List users (with pagination)
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}
```

### Error Handling

gRPC uses status codes for errors. Common codes:
- `OK` (0) - Success
- `INVALID_ARGUMENT` (3) - Invalid request parameters
- `NOT_FOUND` (5) - Resource not found
- `ALREADY_EXISTS` (6) - Resource already exists
- `INTERNAL` (13) - Internal server error

## Integration with Services

### In NestJS Services

```typescript
import { UsersServiceClient } from '@shared/proto/generated/users.pb';

@Injectable()
export class MyService {
  constructor(
    @Inject('USERS_SERVICE_CLIENT') 
    private usersClient: UsersServiceClient
  ) {}

  async getUser(userId: string) {
    const request = { userId };
    return this.usersClient.getUser(request);
  }
}
```

### In Gateway

```typescript
import { UsersServiceClient } from '@shared/proto/generated/users.pb';

@Controller('api/users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE_CLIENT')
    private usersClient: UsersServiceClient
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const response = await this.usersClient.getUser({ userId: id });
    return response.user;
  }
}
```

## Validation

Run validation to check proto files:
```bash
pnpm validate-contracts
# or
node build-scripts/validate-contracts.ts
```

## Resources

- [Protocol Buffers Language Guide](https://protobuf.dev/programming-guides/proto3/)
- [gRPC Documentation](https://grpc.io/docs/)
- [ts-proto Documentation](https://github.com/stephenh/ts-proto)

