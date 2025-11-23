import { Module } from "@nestjs/common";
import {
  ActivityTrackingController,
  BookClubsController,
  FeedController,
  FollowController,
  GroupsController,
  PostsController,
  ReadingChallengesController,
} from "./social.controller";
import { SocialClientModule } from "../../clients/social-client.module";
import { SocialService } from "../social/social.service";

@Module({
  imports: [SocialClientModule], // gRPC client for social-service
  providers: [SocialService],
  controllers: [
    FeedController,
    PostsController,
    GroupsController,
    FollowController,
    BookClubsController,
    ReadingChallengesController,
    ActivityTrackingController,
  ],
  exports: [SocialService],
})
export class SocialModule {}

