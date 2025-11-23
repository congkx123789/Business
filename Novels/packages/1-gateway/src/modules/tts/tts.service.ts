import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";

interface AIServiceClient {
  SynthesizeSpeech(data: { text: string; language: string; voice?: string; speed?: number; emotion?: string; voiceStyle?: string; context?: string }): Observable<GrpcResponse<any>>;
  SynthesizeEmotionalSpeech(data: { text: string; language: string; emotion: string; voiceStyle?: string; speed?: number }): Observable<GrpcResponse<any>>;
  GetTTSWithSync(data: { text: string; language: string; voice?: string; syncMode?: string }): Observable<GrpcResponse<any>>;
  GetHumanNarration(data: { storyId: string; chapterId: string }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class TTSService {
  private readonly aiService: AIServiceClient;

  constructor(@Inject("AI_SERVICE") private readonly aiClient: ClientGrpc) {
    this.aiService = this.aiClient.getService<AIServiceClient>("AIService");
  }

  async synthesizeSpeech(
    text: string,
    language: string,
    voice?: string,
    speed?: number,
    emotion?: string,
    voiceStyle?: string,
    context?: string,
  ) {
    try {
      const result = await getGrpcResponse(
        this.aiService.SynthesizeSpeech({ text, language, voice, speed, emotion, voiceStyle, context }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to synthesize speech",
      };
    }
  }

  async synthesizeEmotionalSpeech(
    text: string,
    language: string,
    emotion: string,
    voiceStyle?: string,
    speed?: number,
  ) {
    try {
      const result = await getGrpcResponse(
        this.aiService.SynthesizeEmotionalSpeech({ text, language, emotion, voiceStyle, speed }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to synthesize emotional speech",
      };
    }
  }

  async getTTSWithSync(text: string, language: string, voice?: string, syncMode?: string) {
    try {
      const result = await getGrpcResponse(
        this.aiService.GetTTSWithSync({ text, language, voice, syncMode }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get TTS with sync",
      };
    }
  }

  async getHumanNarration(storyId: string, chapterId: string) {
    try {
      const result = await getGrpcResponse(this.aiService.GetHumanNarration({ storyId, chapterId }));
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get human narration",
      };
    }
  }
}















