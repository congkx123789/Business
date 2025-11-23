import { Module } from "@nestjs/common";
import { CommentsClientModule } from "../../clients/comments-client.module";
import { CommentsController } from "./comments.controller";
import { CommentsResolver } from "./comments.resolver";
import { CommentsService } from "./comments.service";

@Module({
  imports: [CommentsClientModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}


