// DTOs and validation schemas using class-validator
// These are used by NestJS backend services

import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber, IsInt, Min, Max } from "class-validator";

// Auth DTOs (legacy - for backward compatibility)
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsString()
  @IsOptional()
  username?: string;
}

// Pagination DTO
export class PaginationQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}

// Export all domain DTOs
export * from "./user";
export * from "./story";
export * from "./social";
export * from "./ai";
export * from "./comment";
export * from "./monetization";
export * from "./community/community.dto";
