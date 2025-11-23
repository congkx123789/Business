import { Injectable } from "@nestjs/common";
import { ContextualTtsService, ContextualTtsPayload } from "./contextual-tts.service";
import { TtsSyncService } from "./tts-sync.service";
import { HumanNarrationService } from "./human-narration.service";

interface NarrationResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  message: string;
  metadata?: {
    emotion: string;
    voiceStyle: string;
  };
  syncPoints?: ReturnType<TtsSyncService["generateSyncMap"]>["syncPoints"];
  syncMode?: ReturnType<TtsSyncService["generateSyncMap"]>["syncMode"];
}

@Injectable()
export class NarrationStrategyService {
  constructor(
    private readonly contextualTtsService: ContextualTtsService,
    private readonly ttsSyncService: TtsSyncService,
    private readonly humanNarrationService: HumanNarrationService
  ) {}

  private mapToResponse(narration: Awaited<ReturnType<ContextualTtsService["synthesize"]>>): NarrationResponse {
    const metadataSummary =
      narration.metadata && narration.metadata.voiceStyle && narration.metadata.emotion
        ? ` | Voice style: ${narration.metadata.voiceStyle}, Emotion: ${narration.metadata.emotion}`
        : "";

    return {
      success: narration.success,
      audioUrl: narration.audioUrl,
      duration: narration.duration,
      message: `${narration.message}${metadataSummary}`,
      metadata: narration.metadata,
    };
  }

  async synthesizeSpeech(text: string, payload: ContextualTtsPayload): Promise<NarrationResponse> {
    const narration = await this.contextualTtsService.synthesize(text, payload);
    const base = this.mapToResponse(narration);

    if (payload.syncMode) {
      const sync = this.ttsSyncService.generateSyncMap(text, payload.syncMode);
      return {
        ...base,
        syncPoints: sync.syncPoints,
        syncMode: sync.syncMode,
        message: `${base.message}. Generated ${sync.syncPoints.length} sync points.`,
      };
    }

    return base;
  }

  async synthesizeEmotionalSpeech(text: string, payload: ContextualTtsPayload): Promise<NarrationResponse> {
    const narration = await this.contextualTtsService.synthesize(text, payload);
    return this.mapToResponse(narration);
  }

  async synthesizeSpeechWithSync(text: string, payload: ContextualTtsPayload): Promise<NarrationResponse> {
    const narration = await this.contextualTtsService.synthesize(text, payload);
    const sync = this.ttsSyncService.generateSyncMap(text, payload.syncMode ?? "sentence-by-sentence");
    const base = this.mapToResponse(narration);
    return {
      ...base,
      syncPoints: sync.syncPoints,
      syncMode: sync.syncMode,
      message: `${base.message}. Generated ${sync.syncPoints.length} sync points.`,
    };
  }

  async getHumanNarration(storyId: string, chapterId: string) {
    return this.humanNarrationService.getNarration(storyId, chapterId);
  }

  async getNarrationOptions(storyId: string, chapterId: string) {
    return this.humanNarrationService.listNarrationOptions(storyId, chapterId);
  }
}

