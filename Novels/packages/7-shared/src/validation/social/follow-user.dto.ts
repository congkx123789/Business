// Follow User DTO

import { IsString, IsNotEmpty } from "class-validator";

export class FollowUserDto {
  @IsString()
  @IsNotEmpty()
  followerId!: string;

  @IsString()
  @IsNotEmpty()
  followingId!: string;
}

