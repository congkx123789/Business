import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AIController } from "./modules/ai/ai.controller";
import { AIService } from "./modules/ai/ai.service";
import { appConfig, aiConfig, cacheConfig, servicesConfig, storageConfig } from "./config/configuration";
import { SummarizationModule } from "./modules/summarization/summarization.module";
import { TranslationModule } from "./modules/translation/translation.module";
import { DictionaryModule } from "./modules/dictionary/dictionary.module";
import { RecommendationsModule } from "./modules/recommendations/recommendations.module";
import { TtsModule } from "./modules/tts/tts.module";
import { CoreModule } from "./core/core.module";
import { ContentGenerationService } from "./modules/ai/content-generation.service";
import { StoriesClientModule } from "./clients/stories-client.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, aiConfig, cacheConfig, storageConfig, servicesConfig],
    }),
    CoreModule,
    SummarizationModule,
    TranslationModule,
    DictionaryModule,
    RecommendationsModule,
    TtsModule,
    StoriesClientModule,
  ],
  controllers: [AIController],
  providers: [AIService, ContentGenerationService],
})
export class AppModule {}

