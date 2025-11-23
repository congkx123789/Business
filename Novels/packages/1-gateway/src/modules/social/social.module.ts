import { Module } from "@nestjs/common";
import { SocialClientModule } from "../../clients/social-client.module";
import { SocialService } from "./social.service";
import { FeedController } from "./feed.controller";
import { PostsController } from "./posts.controller";
import { GroupsController } from "./groups.controller";
import { BookClubsController } from "./book-clubs.controller";
import { ReadingChallengesController } from "./reading-challenges.controller";
import { ActivityTrackingController } from "./activity-tracking.controller";
import { FeedResolver } from "./feed.resolver";
import { PostsResolver } from "./posts.resolver";
import { GroupsResolver } from "./groups.resolver";
import { BookClubsResolver } from "./book-clubs.resolver";
import { ReadingChallengesResolver } from "./reading-challenges.resolver";
import { ActivityTrackingResolver } from "./activity-tracking.resolver";

@Module({
  imports: [SocialClientModule],
  controllers: [
    FeedController,
    PostsController,
    GroupsController,
    BookClubsController,
    ReadingChallengesController,
    ActivityTrackingController,
  ],
  providers: [
    SocialService,
    FeedResolver,
    PostsResolver,
    GroupsResolver,
    BookClubsResolver,
    ReadingChallengesResolver,
    ActivityTrackingResolver,
  ],
  exports: [SocialService],
})
export class SocialModule {}


