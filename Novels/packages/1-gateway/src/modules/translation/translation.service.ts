import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";

interface AIServiceClient {
  TranslateText(data: { text: string; fromLang: string; toLang: string; context?: string }): Observable<GrpcResponse<any>>;
  TranslateSentence(data: { sentence: string; fromLang: string; toLang: string; context?: string }): Observable<GrpcResponse<any>>;
  GetParallelTranslation(data: { text: string; fromLang: string; toLang: string; displayMode?: string }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class TranslationService {
  private readonly aiService: AIServiceClient;

  constructor(@Inject("AI_SERVICE") private readonly aiClient: ClientGrpc) {
    this.aiService = this.aiClient.getService<AIServiceClient>("AIService");
  }

  async translateText(text: string, fromLang: string, toLang: string, context?: string) {
    try {
      const result = await getGrpcResponse(
        this.aiService.TranslateText({ text, fromLang, toLang, context }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to translate text",
      };
    }
  }

  async translateSentence(sentence: string, fromLang: string, toLang: string, context?: string) {
    try {
      const result = await getGrpcResponse(
        this.aiService.TranslateSentence({ sentence, fromLang, toLang, context }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to translate sentence",
      };
    }
  }

  async getParallelTranslation(
    text: string,
    fromLang: string,
    toLang: string,
    displayMode?: string,
  ) {
    try {
      const result = await getGrpcResponse(
        this.aiService.GetParallelTranslation({ text, fromLang, toLang, displayMode }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get parallel translation",
      };
    }
  }
}















