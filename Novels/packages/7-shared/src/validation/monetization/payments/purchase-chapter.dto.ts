// Purchase Chapter DTO

import { IsString, IsNotEmpty } from 'class-validator';

export class PurchaseChapterDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  storyId!: string;
}

