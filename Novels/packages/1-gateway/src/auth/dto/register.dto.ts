import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from "class-validator";

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
  @MaxLength(50)
  username?: string;
}

