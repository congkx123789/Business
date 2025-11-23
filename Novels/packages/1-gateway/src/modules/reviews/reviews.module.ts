import { Module } from "@nestjs/common";
import { CommentsClientModule } from "../../clients/comments-client.module";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  imports: [CommentsClientModule], // gRPC client for comments-service
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
