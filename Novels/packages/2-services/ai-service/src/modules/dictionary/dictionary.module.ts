import { Module } from "@nestjs/common";
import { DictionaryService } from "./dictionary.service";
import { DictionaryIntegrationService } from "./dictionary-integration.service";
import { PronunciationService } from "./pronunciation.service";

@Module({
  providers: [DictionaryService, DictionaryIntegrationService, PronunciationService],
  exports: [DictionaryService],
})
export class DictionaryModule {}


