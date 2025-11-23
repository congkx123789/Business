import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { QueueModule } from "../../common/queue/queue.module";
import { CacheModule as StoriesCacheModule } from "../../common/cache/cache.module";
import { SearchModule } from "../search/search.module";
import { StoriesService } from "./stories.service";

@Module({
  imports: [DatabaseModule, QueueModule, StoriesCacheModule, SearchModule],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}


