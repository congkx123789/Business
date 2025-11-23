import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import {
  getGrpcDataOrThrow,
  getGrpcResultOrThrow,
} from "../../common/utils/grpc.util";

interface UsersServiceClient {
  GetAnnotations(data: {
    userId: string;
    chapterId: string;
  }): Observable<GrpcResponse<any[]>>;
  CreateAnnotation(data: {
    userId: string;
    storyId: string;
    chapterId: string;
    selectedText: string;
    startOffset: number;
    endOffset: number;
    note: string;
    color?: string;
  }): Observable<GrpcResponse<any>>;
  UpdateAnnotation(data: {
    annotationId: string;
    note?: string;
    color?: string;
  }): Observable<GrpcResponse<any>>;
  DeleteAnnotation(data: {
    annotationId: string;
  }): Observable<GrpcResponse<any>>;
  GetRevisitationQueue(data: {
    userId: string;
    chapterId: string;
  }): Observable<GrpcResponse<any>>;
}

interface AiServiceClient {
  GenerateAnnotationSummary(data: {
    userId: string;
    chapterId: string;
    highlightIds?: string[];
  }): Observable<GrpcResponse<any>>;
  ExportAnnotations(data: {
    userId: string;
    format: string;
    destination?: string;
  }): Observable<GrpcResponse<any>>;
  UnifyAnnotations(data: {
    userId: string;
    sources: Array<{ type: string; payload: Record<string, any> }>;
  }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class AnnotationsService implements OnModuleInit {
  private usersService!: UsersServiceClient;
  private aiService!: AiServiceClient;

  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientGrpc,
    @Inject("AI_SERVICE") private readonly aiClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.usersClient.getService<UsersServiceClient>("UsersService");
    this.aiService = this.aiClient.getService<AiServiceClient>("AIService");
  }

  getAnnotations(userId: string, chapterId: string) {
    return getGrpcResultOrThrow(
      this.usersService.GetAnnotations({ userId, chapterId }),
      "Failed to load annotations",
    );
  }

  createAnnotation(userId: string, dto: any) {
    return getGrpcDataOrThrow(
      this.usersService.CreateAnnotation({ userId, ...dto }),
      "Failed to create annotation",
    );
  }

  updateAnnotation(annotationId: string, dto: any) {
    return getGrpcDataOrThrow(
      this.usersService.UpdateAnnotation({ annotationId, ...dto }),
      "Failed to update annotation",
    );
  }

  deleteAnnotation(annotationId: string) {
    return getGrpcDataOrThrow(
      this.usersService.DeleteAnnotation({ annotationId }),
      "Failed to delete annotation",
    );
  }

  generateSummary(inputUserId: string, payload: { chapterId: string; highlightIds?: string[] }) {
    return getGrpcDataOrThrow(
      this.aiService.GenerateAnnotationSummary({
        userId: inputUserId,
        chapterId: payload.chapterId,
        highlightIds: payload.highlightIds,
      }),
      "Failed to generate annotation summary",
    );
  }

  exportAnnotations(userId: string, payload: { format: string; destination?: string }) {
    return getGrpcDataOrThrow(
      this.aiService.ExportAnnotations({ userId, ...payload }),
      "Failed to export annotations",
    );
  }

  unifyAnnotations(
    userId: string,
    payload: { sources: Array<{ type: string; payload: Record<string, any> }> },
  ) {
    return getGrpcDataOrThrow(
      this.aiService.UnifyAnnotations({ userId, ...payload }),
      "Failed to unify annotations",
    );
  }

  getRevisitationQueue(userId: string, chapterId: string) {
    return getGrpcDataOrThrow(
      this.usersService.GetRevisitationQueue({ userId, chapterId }),
      "Failed to load revisitation queue",
    );
  }
}















