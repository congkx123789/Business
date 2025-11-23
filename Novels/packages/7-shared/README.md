# 7-shared Package

The "Common Dictionary" for all packages. Contains types, DTOs, constants, and gRPC proto files.

## Structure

```
7-shared/
├── src/
│   ├── types/          # Common types and interfaces
│   ├── validation/     # DTOs using class-validator
│   ├── constants/      # Event Bus topics, roles, stored procedures
│   ├── proto/          # gRPC proto files
│   └── index.ts        # Main export file
├── package.json
└── tsconfig.json
```

## Usage

### Import Types
```typescript
import { User, Book, Chapter } from "7-shared/src/types";
```

### Import Validation DTOs
```typescript
import { LoginDto, RegisterDto, CreateBookDto } from "7-shared/src/validation";
```

### Import Constants
```typescript
import { EVENT_BUS_TOPICS, USER_ROLES, STORED_PROCEDURES } from "7-shared/src/constants";
```

### Import Proto Files
```typescript
// Proto files are compiled to TypeScript using ts-proto
// After compilation, import generated types
import { UsersServiceClient } from "7-shared/src/proto/users.client";
```

## Proto Files

- `users.proto` - Users service gRPC contract
- `stories.proto` - Stories service gRPC contract
- `comments.proto` - Comments service gRPC contract

## Compiling Proto Files

```bash
# Install ts-proto
pnpm add -D ts-proto

# Compile proto files to TypeScript
npx protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/proto/generated \
  --proto_path=./src/proto \
  ./src/proto/*.proto
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build
```

## Notes

- This package is the single source of truth for all shared types and contracts (Rule #3)
- All API contract changes MUST begin here
- Proto files are defined here and compiled to TypeScript for use in services

