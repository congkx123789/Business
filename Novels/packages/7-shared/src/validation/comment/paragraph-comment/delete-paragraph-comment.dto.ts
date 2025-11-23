// Delete Paragraph Comment DTO

import { IsString, IsNotEmpty } from "class-validator";

export class DeleteParagraphCommentDto {
  @IsString()
  @IsNotEmpty()
  commentId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

