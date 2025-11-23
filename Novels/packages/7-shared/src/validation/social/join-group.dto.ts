import { IsNotEmpty, IsString } from "class-validator";

export class JoinGroupDto {
  @IsString()
  @IsNotEmpty()
  groupId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}


