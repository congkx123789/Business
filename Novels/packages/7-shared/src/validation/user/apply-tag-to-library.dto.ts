import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyTagToLibraryDto {
  @IsString()
  @IsNotEmpty()
  libraryId!: string;

  @IsString()
  @IsNotEmpty()
  tagId!: string;
}

