import { Module } from "@nestjs/common";
import { TtsService } from "./tts.service";
import { EmotionalTtsService } from "./emotional-tts.service";
import { ContextualTtsService } from "./contextual-tts.service";
import { TtsSyncService } from "./tts-sync.service";
import { HumanNarrationService } from "./human-narration.service";
import { NarrationStrategyService } from "./narration-strategy.service";
import { TtsQueueWorker } from "./workers/tts-queue.worker";

@Module({
  providers: [
    TtsService,
    EmotionalTtsService,
    ContextualTtsService,
    TtsSyncService,
    HumanNarrationService,
    NarrationStrategyService,
    TtsQueueWorker,
  ],
  exports: [NarrationStrategyService, HumanNarrationService],
})
export class TtsModule {}


