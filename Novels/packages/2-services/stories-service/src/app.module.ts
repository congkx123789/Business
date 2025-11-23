import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, databaseConfig } from "./config/configuration";
import { DatabaseModule } from "./common/database/database.module";
import { QueueModule } from "./common/queue/queue.module";
import { CacheModule } from "./common/cache/cache.module";
import { StoriesModule } from "./modules/stories/stories.module";
import { ChaptersModule } from "./modules/chapters/chapters.module";
import { GenresModule } from "./modules/genres/genres.module";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { DrmModule } from "./modules/drm/drm.module";
import { SearchModule } from "./modules/search/search.module";
import { StorageModule } from "./modules/storage/storage.module";
import { StoriesController } from "./controllers/stories.controller";
import { ChapterEventsWorker, StoryEventsWorker } from "./workers/story-events.worker";
import { RankingCalculationWorker } from "./workers/ranking-calculation.worker";
import { ReadingProgressModule } from "./modules/reading-progress/reading-progress.module";
import { AuthorModule } from "./modules/author/author.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    QueueModule, // Event Bus (BullMQ) for async communication
    CacheModule, // Redis cache for hot stories (Rule #7)
    StoriesModule,
    ChaptersModule,
    GenresModule,
    DiscoveryModule,
    DrmModule,
    SearchModule,
    StorageModule, // S3 + CloudFront CDN for chapter content
    ReadingProgressModule,
    AuthorModule,
  ],
  controllers: [StoriesController],
  providers: [StoryEventsWorker, ChapterEventsWorker, RankingCalculationWorker],
})
export class AppModule {}

