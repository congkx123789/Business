import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveFromLibraryDto {
  @IsString()
  @IsNotEmpty()
  storyId!: string;
}

