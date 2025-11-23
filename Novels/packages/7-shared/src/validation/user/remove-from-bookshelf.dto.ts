import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveFromBookshelfDto {
  @IsString()
  @IsNotEmpty()
  bookshelfId!: string;

  @IsString()
  @IsNotEmpty()
  libraryId!: string;
}

