import { Injectable } from "@nestjs/common";
import { EmotionalTtsService, EmotionalTtsOptions } from "./emotional-tts.service";
import { TtsResponse } from "./tts.service";

export interface ContextualTtsPayload extends EmotionalTtsOptions {
  context?: string;
  syncMode?: "word-by-word" | "sentence-by-sentence";
}

@Injectable()
export class ContextualTtsService {
  constructor(private readonly emotionalTtsService: EmotionalTtsService) {}

  async synthesize(
    text: string,
    payload: ContextualTtsPayload
  ): Promise<
    TtsResponse & {
      metadata: {
        emotion: string;
        voiceStyle: string;
      };
    }
  > {
    const enhancedPayload: EmotionalTtsOptions = {
      ...payload,
      emotion: payload.emotion ?? this.detectEmotion(payload.context),
    };

    return this.emotionalTtsService.synthesize(text, enhancedPayload);
  }

  private detectEmotion(context?: string) {
    if (!context) {
      return "calm and soothing";
    }

    if (context.toLowerCase().includes("battle")) {
      return "emotional and dramatic";
    }

    return "calm and soothing";
  }
}


