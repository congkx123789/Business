import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { CacheModule as StoriesCacheModule } from "../../common/cache/cache.module";
import { GenresModule } from "../genres/genres.module";
import { StoriesModule } from "../stories/stories.module";
import { DiscoveryService } from "./discovery.service";
import { RankingService } from "./ranking.service";
import { CurationService } from "./curation.service";
import { StorefrontService } from "./storefront.service";
import { VotingService } from "./voting.service";

@Module({
  imports: [
    DatabaseModule,
    StoriesCacheModule,
    GenresModule,
    StoriesModule,
  ],
  providers: [DiscoveryService, RankingService, CurationService, StorefrontService, VotingService],
  exports: [DiscoveryService, RankingService, CurationService, StorefrontService, VotingService],
})
export class DiscoveryModule {}


