import { IsNotEmpty, IsString } from 'class-validator';

export class MoveToLibraryDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;
}

