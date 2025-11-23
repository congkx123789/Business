import { Module } from "@nestjs/common";
import { TTSController } from "./tts.controller";
import { TTSService } from "./tts.service";
import { TTSResolver } from "./tts.resolver";
import { TranslationController } from "../translation/translation.controller";
import { TranslationService } from "../translation/translation.service";
import { TranslationResolver } from "../translation/translation.resolver";
import { DictionaryController } from "../dictionary/dictionary.controller";
import { DictionaryService } from "../dictionary/dictionary.service";
import { DictionaryResolver } from "../dictionary/dictionary.resolver";
import { AIClientModule } from "../../clients/ai-client.module";

@Module({
  imports: [AIClientModule],
  controllers: [TTSController, TranslationController, DictionaryController],
  providers: [
    TTSService,
    TTSResolver,
    TranslationService,
    TranslationResolver,
    DictionaryService,
    DictionaryResolver,
  ],
})
export class TTSModule {}















