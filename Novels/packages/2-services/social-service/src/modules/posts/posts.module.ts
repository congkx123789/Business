import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EventsModule } from "../../events/events.module";
import { PostsService } from "./posts.service";

@Module({
  imports: [PrismaModule, EventsModule],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}


