import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveTagFromLibraryDto {
  @IsString()
  @IsNotEmpty()
  libraryId!: string;

  @IsString()
  @IsNotEmpty()
  tagId!: string;
}

