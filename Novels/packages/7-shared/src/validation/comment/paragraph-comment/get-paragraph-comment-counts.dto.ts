// Get Paragraph Comment Counts DTO (for bubble indicators)

import { IsString, IsNotEmpty } from 'class-validator';

export class GetParagraphCommentCountsDto {
  @IsString()
  @IsNotEmpty()
  chapterId!: string;
}

