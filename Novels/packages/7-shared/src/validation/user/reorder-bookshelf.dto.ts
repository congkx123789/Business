import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BookshelfOrderItemDto {
  @IsString()
  @IsNotEmpty()
  libraryId!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}

export class ReorderBookshelfDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookshelfOrderItemDto)
  items!: BookshelfOrderItemDto[];
}

