# TypeScript Types Guide

## Overview

This guide explains how to create and use TypeScript types and interfaces in the `7-shared` package. Types define the data structures used throughout the application.

## Location

All types are located in:
```
packages/7-shared/src/types/
```

Organized by domain:
- `types/user/` - User-related types
- `types/story/` - Story-related types
- `types/ai/` - AI-related types
- `types/comment/` - Comment-related types
- `types/social/` - Social-related types
- `types/monetization/` - Monetization-related types

## Type Structure

### Basic Interface

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Optional Fields

Use `?` for optional fields:
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;        // Optional
  bio?: string;           // Optional
  createdAt: Date;
  updatedAt: Date;
}
```

### Nested Types

```typescript
export interface Profile {
  userId: string;
  displayName: string;
  avatar?: string;
  bio?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  profile?: Profile;      // Nested type
  createdAt: Date;
  updatedAt: Date;
}
```

### Union Types

```typescript
export type UserRole = 'admin' | 'user' | 'moderator';
export type ReadingMode = 'scroll' | 'page';
export type BackgroundColor = 'white' | 'black' | 'sepia' | 'eye-protection' | 'custom';
```

### Enum-like Types

```typescript
export const MissionType = {
  CHECK_IN: 'check-in',
  READING: 'reading',
  AD: 'ad',
  VOTING: 'voting',
} as const;

export type MissionType = typeof MissionType[keyof typeof MissionType];
```

## Creating a New Type

### Step 1: Create the Type File

Create a new file in the appropriate domain folder:
```typescript
// types/user/user.types.ts
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  userId: string;
  displayName: string;
  avatar?: string;
}
```

### Step 2: Export from Domain Index

Update the domain's `index.ts`:
```typescript
// types/user/index.ts
export * from './user.types';
// ... other exports
```

### Step 3: Export from Main Index

Update the main `types/index.ts`:
```typescript
// types/index.ts
export * from './user';
// ... other exports
```

## Type Patterns

### Entity Pattern

For database entities:
```typescript
export interface Story {
  id: string;
  title: string;
  description: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### DTO Pattern

For data transfer (often matches DTOs):
```typescript
export interface CreateStoryRequest {
  title: string;
  description: string;
  authorId: string;
}
```

### Response Pattern

For API responses:
```typescript
export interface GetStoryResponse {
  story: Story;
  chapters: Chapter[];
  metadata: {
    totalChapters: number;
    lastUpdated: Date;
  };
}
```

### Query Pattern

For query/filter operations:
```typescript
export interface StoryQuery {
  genre?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sort?: 'recent' | 'popular' | 'rating';
}
```

## Advanced Types

### Generic Types

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Usage
export type PaginatedStories = PaginatedResponse<Story>;
export type PaginatedUsers = PaginatedResponse<User>;
```

### Utility Types

```typescript
// Make all fields optional
export type PartialUser = Partial<User>;

// Pick specific fields
export type UserSummary = Pick<User, 'id' | 'username' | 'email'>;

// Omit specific fields
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Make specific fields required
export type UserWithRequiredEmail = User & { email: string };
```

### Discriminated Unions

```typescript
export type Notification = 
  | { type: 'comment'; commentId: string; storyId: string }
  | { type: 'like'; storyId: string; userId: string }
  | { type: 'follow'; followerId: string };

// Usage with type guards
function handleNotification(notification: Notification) {
  if (notification.type === 'comment') {
    // TypeScript knows notification has commentId and storyId
    console.log(notification.commentId);
  }
}
```

## Type Organization

### Single Responsibility

Each type file should focus on a single domain concept:
```typescript
// ✅ Good - focused
// types/user/user.types.ts
export interface User { ... }

// types/user/profile.types.ts
export interface Profile { ... }

// ❌ Bad - too many concepts
// types/user/user.types.ts
export interface User { ... }
export interface Profile { ... }
export interface Settings { ... }
export interface Preferences { ... }
```

### Related Types Together

Keep closely related types in the same file:
```typescript
// types/user/library.types.ts
export interface Library { ... }
export interface Bookshelf { ... }
export interface BookshelfItem { ... }
export interface Wishlist { ... }
```

## Usage

### In Services

```typescript
import { User, CreateUserRequest } from '@shared/types';

@Injectable()
export class UsersService {
  async createUser(request: CreateUserRequest): Promise<User> {
    // Use types for type safety
    const user: User = {
      id: generateId(),
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return user;
  }
}
```

### In Frontend

```typescript
import { Story, Chapter } from '@shared/types';

function StoryCard({ story }: { story: Story }) {
  // TypeScript provides autocomplete and type checking
  return (
    <div>
      <h2>{story.title}</h2>
      <p>{story.description}</p>
    </div>
  );
}
```

## Best Practices

### 1. Use Interfaces for Objects

```typescript
// ✅ Good - use interface for objects
export interface User {
  id: string;
  name: string;
}

// ❌ Bad - don't use type for simple objects
export type User = {
  id: string;
  name: string;
};
```

### 2. Use Types for Unions/Primitives

```typescript
// ✅ Good - use type for unions
export type UserRole = 'admin' | 'user' | 'moderator';
export type Status = 'active' | 'inactive' | 'pending';

// ✅ Good - use type for primitives
export type UserId = string;
export type Timestamp = number;
```

### 3. Avoid `any`

```typescript
// ✅ Good - use specific types
function processUser(user: User) { ... }

// ❌ Bad - avoid any
function processUser(user: any) { ... }
```

### 4. Use Readonly for Immutability

```typescript
export interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

### 5. Document Complex Types

```typescript
/**
 * Reading preferences for the reader interface
 * 
 * @property fontSize - Font size in pixels (12-24, default: 16)
 * @property readingMode - 'scroll' for continuous scroll, 'page' for page turn
 * @property backgroundColor - Background color mode
 */
export interface ReadingPreferences {
  fontSize: number;
  readingMode: 'scroll' | 'page';
  backgroundColor: 'white' | 'black' | 'sepia' | 'eye-protection' | 'custom';
}
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

