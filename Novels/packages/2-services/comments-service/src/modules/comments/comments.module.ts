import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { ParagraphCommentsService } from "./paragraph-comments.service";
import { ChapterCommentsService } from "./chapter-comments.service";

@Module({
  providers: [CommentsService, ParagraphCommentsService, ChapterCommentsService],
  exports: [CommentsService, ParagraphCommentsService, ChapterCommentsService],
})
export class CommentsModule {}


