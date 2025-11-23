import { IsNumber } from "class-validator";

// TODO: Move to 7-shared validation package once contracts are finalized.
export class DownloadChapterDto {
  @IsNumber()
  chapterId!: number;

  @IsNumber()
  userId!: number;
}


