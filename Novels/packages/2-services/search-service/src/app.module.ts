import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, meilisearchConfig } from "./config/configuration";
import { QueueModule } from "./common/queue/queue.module";
import { SearchModule } from "./modules/search/search.module";
import { StoryIndexerWorker } from "./workers/story-indexer.worker";
import { PostIndexerWorker } from "./workers/post-indexer.worker";
import { SearchController } from "./controllers/search.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, meilisearchConfig],
    }),
    QueueModule,
    SearchModule,
  ],
  controllers: [SearchController],
  providers: [StoryIndexerWorker, PostIndexerWorker],
})
export class AppModule {}

