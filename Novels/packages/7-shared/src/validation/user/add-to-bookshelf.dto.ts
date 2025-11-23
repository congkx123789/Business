import { IsNotEmpty, IsString } from 'class-validator';

export class AddToBookshelfDto {
  @IsString()
  @IsNotEmpty()
  bookshelfId!: string;

  @IsString()
  @IsNotEmpty()
  libraryId!: string;
}

