import { Module } from "@nestjs/common";
import { CommunityService } from "./community.service";
import { ParagraphCommentsController } from "./paragraph-comments.controller";
import { ParagraphCommentsResolver } from "./paragraph-comments.resolver";
import { ChapterCommentsController } from "./chapter-comments.controller";
import { ChapterCommentsResolver } from "./chapter-comments.resolver";
import { ReviewsForumsController } from "./reviews-forums.controller";
import { ReviewsForumsResolver } from "./reviews-forums.resolver";
import { PlatformInteractionsController } from "./platform-interactions.controller";
import { PlatformInteractionsResolver } from "./platform-interactions.resolver";
import { FanEconomyController } from "./fan-economy.controller";
import { FanEconomyResolver } from "./fan-economy.resolver";
import { CommunityClientModule } from "../../clients/community-client.module";

@Module({
  imports: [CommunityClientModule],
  controllers: [
    ParagraphCommentsController,
    ChapterCommentsController,
    ReviewsForumsController,
    PlatformInteractionsController,
    FanEconomyController,
  ],
  providers: [
    CommunityService,
    ParagraphCommentsResolver,
    ChapterCommentsResolver,
    ReviewsForumsResolver,
    PlatformInteractionsResolver,
    FanEconomyResolver,
  ],
  exports: [CommunityService],
})
export class CommunityModule {}
