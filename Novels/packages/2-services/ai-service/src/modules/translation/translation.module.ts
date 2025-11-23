import { Module } from "@nestjs/common";
import { TranslationService } from "./translation.service";
import { ParallelTranslationService } from "./parallel-translation.service";
import { StoriesClientModule } from "../../clients/stories-client.module";
import { TranslationCacheService } from "./translation-cache.service";

@Module({
  imports: [StoriesClientModule],
  providers: [TranslationService, ParallelTranslationService, TranslationCacheService],
  exports: [TranslationService, ParallelTranslationService],
})
export class TranslationModule {}


