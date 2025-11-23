import { Injectable } from "@nestjs/common";
import { TtsService, TtsOptions, TtsResponse } from "./tts.service";

export interface EmotionalTtsOptions extends TtsOptions {
  emotion?: "emotional and dramatic" | "calm and soothing";
  voiceStyle?: "terrified" | "sad" | "shouting" | "whispering" | "cheerful" | "angry";
}

@Injectable()
export class EmotionalTtsService {
  constructor(private readonly ttsService: TtsService) {}

  async synthesize(text: string, options: EmotionalTtsOptions): Promise<
    TtsResponse & {
      metadata: {
        emotion: string;
        voiceStyle: string;
      };
    }
  > {
    const base = await this.ttsService.synthesizeSpeech(text, options);
    return {
      ...base,
      metadata: {
        emotion: options.emotion ?? "calm and soothing",
        voiceStyle: options.voiceStyle ?? "cheerful",
      },
    };
  }
}


