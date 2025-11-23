import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";

interface AIServiceClient {
  LookupWord(data: {
    word: string;
    fromLang: string;
    toLang: string;
    dictionarySource?: string;
  }): Observable<GrpcResponse<any>>;
  TouchTranslate(data: {
    word: string;
    fromLang: string;
    toLang: string;
    position?: { x: number; y: number };
  }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class DictionaryService {
  private readonly aiService: AIServiceClient;

  constructor(@Inject("AI_SERVICE") private readonly aiClient: ClientGrpc) {
    this.aiService = this.aiClient.getService<AIServiceClient>("AIService");
  }

  async lookupWord(word: string, fromLang: string, toLang: string, dictionarySource?: string) {
    try {
      const result = await getGrpcResponse(
        this.aiService.LookupWord({ word, fromLang, toLang, dictionarySource }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to lookup word",
      };
    }
  }

  async touchTranslate(
    word: string,
    fromLang: string,
    toLang: string,
    position?: { x: number; y: number },
  ) {
    try {
      const result = await getGrpcResponse(
        this.aiService.TouchTranslate({ word, fromLang, toLang, position }),
      );
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to translate word",
      };
    }
  }
}















