import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { CacheModule } from "../../common/cache/cache.module";
import { EventsModule } from "../../events/events.module";
import { ReadingChallengesService } from "./reading-challenges.service";
import { CommunityChallengesService } from "./community-challenges.service";
import { ActivityTrackingModule } from "../activity-tracking/activity-tracking.module";

@Module({
  imports: [PrismaModule, CacheModule, EventsModule, ActivityTrackingModule],
  providers: [ReadingChallengesService, CommunityChallengesService],
  exports: [ReadingChallengesService, CommunityChallengesService],
})
export class ReadingChallengesModule {}


