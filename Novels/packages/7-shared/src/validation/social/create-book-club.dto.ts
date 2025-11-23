import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBookClubDto {
  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  storyId!: string;
}


