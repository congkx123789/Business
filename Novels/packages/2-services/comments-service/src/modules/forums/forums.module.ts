import { Module } from "@nestjs/common";
import { ForumsService } from "./forums.service";
import { ForumThreadsService } from "./forum-threads.service";

@Module({
  providers: [ForumsService, ForumThreadsService],
  exports: [ForumsService, ForumThreadsService],
})
export class ForumsModule {}


