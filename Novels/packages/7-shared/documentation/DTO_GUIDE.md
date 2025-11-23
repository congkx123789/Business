# Data Transfer Object (DTO) Guide

## Overview

This guide explains how to create and use Data Transfer Objects (DTOs) in the `7-shared` package. DTOs are used for validation and type safety when transferring data between services and clients.

## Location

All DTOs are located in:
```
packages/7-shared/src/validation/
```

Organized by domain:
- `validation/user/` - User-related DTOs
- `validation/story/` - Story-related DTOs
- `validation/ai/` - AI-related DTOs
- `validation/comment/` - Comment-related DTOs
- `validation/social/` - Social-related DTOs
- `validation/monetization/` - Monetization-related DTOs

## DTO Structure

### Basic DTO

```typescript
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
```

### Update DTO (Partial Updates)

For update operations, make all fields optional:

```typescript
import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;
}
```

## Validation Decorators

### Common Decorators

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@IsString()` | Must be a string | `@IsString() name: string;` |
| `@IsNumber()` | Must be a number | `@IsNumber() age: number;` |
| `@IsBoolean()` | Must be a boolean | `@IsBoolean() isActive: boolean;` |
| `@IsEmail()` | Must be a valid email | `@IsEmail() email: string;` |
| `@IsNotEmpty()` | Cannot be empty | `@IsNotEmpty() name: string;` |
| `@IsOptional()` | Field is optional | `@IsOptional() notes?: string;` |
| `@MinLength(n)` | Minimum string length | `@MinLength(3) username: string;` |
| `@MaxLength(n)` | Maximum string length | `@MaxLength(100) title: string;` |
| `@Min(n)` | Minimum number value | `@Min(0) count: number;` |
| `@Max(n)` | Maximum number value | `@Max(100) percentage: number;` |
| `@IsIn([...])` | Must be one of the values | `@IsIn(['active', 'inactive']) status: string;` |
| `@IsArray()` | Must be an array | `@IsArray() tags: string[];` |
| `@ValidateNested()` | Validate nested object | `@ValidateNested() @Type(() => AddressDto) address: AddressDto;` |

### Advanced Validation

```typescript
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  ValidateNested,
  ArrayMinSize,
  Matches 
} from 'class-validator';
import { Type } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex color' })
  color?: string;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: 'Zip code must be 5 digits' })
  zipCode: string;
}
```

## Creating a New DTO

### Step 1: Create the DTO File

Create a new file in the appropriate domain folder:
```typescript
// validation/user/create-user.dto.ts
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
```

### Step 2: Export from Index

Update the domain's `index.ts`:
```typescript
// validation/user/index.ts
export * from './create-user.dto';
// ... other exports
```

### Step 3: Export from Main Index

Update the main `validation/index.ts`:
```typescript
// validation/index.ts
export * from './user';
// ... other exports
```

## DTO Patterns

### Create vs Update Pattern

```typescript
// Create DTO - all required fields
export class CreateStoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

// Update DTO - all optional fields
export class UpdateStoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
```

### Query DTO Pattern

For query/filter operations:
```typescript
export class GetStoriesQueryDto {
  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsIn(['recent', 'popular', 'rating'])
  sort?: string;
}
```

### Nested Object Pattern

```typescript
import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReadingPreferencesDto {
  @IsOptional()
  @IsNumber()
  @Min(12)
  @Max(24)
  fontSize?: number;

  @IsOptional()
  @IsIn(['scroll', 'page'])
  readingMode?: 'scroll' | 'page';
}

export class UpdateReadingPreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ReadingPreferencesDto)
  preferences?: ReadingPreferencesDto;
}
```

## Usage in Services

### In NestJS Services

```typescript
import { CreateUserDto } from '@shared/validation/user';

@Injectable()
export class UsersService {
  async createUser(dto: CreateUserDto) {
    // DTO is already validated by NestJS ValidationPipe
    // You can use dto.email, dto.password directly
    return this.userRepository.create(dto);
  }
}
```

### In Controllers

```typescript
import { CreateUserDto } from '@shared/validation/user';
import { Body, Post, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('api/users')
export class UsersController {
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
```

## Best Practices

### 1. Always Use DTOs

Never accept raw objects in service methods:
```typescript
// ✅ Good
async createUser(dto: CreateUserDto) { ... }

// ❌ Bad
async createUser(data: any) { ... }
```

### 2. Keep DTOs Focused

Each DTO should represent a single operation:
```typescript
// ✅ Good - separate DTOs
CreateUserDto
UpdateUserDto
GetUserQueryDto

// ❌ Bad - one DTO for everything
UserDto  // Too generic
```

### 3. Use Descriptive Names

DTO names should clearly indicate their purpose:
```typescript
// ✅ Good
CreateUserDto
UpdateReadingPreferencesDto
GetStoriesByGenreQueryDto

// ❌ Bad
UserDto
PreferencesDto
QueryDto
```

### 4. Validate Early

Add validation decorators to catch errors early:
```typescript
// ✅ Good - comprehensive validation
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

// ❌ Bad - no validation
export class CreateUserDto {
  email: string;  // No validation
}
```

## Resources

- [class-validator Documentation](https://github.com/typestack/class-validator)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

