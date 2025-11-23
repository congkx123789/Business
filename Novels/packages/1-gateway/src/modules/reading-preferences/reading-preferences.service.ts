import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcDataOrThrow } from "../../common/utils/grpc.util";

interface UsersServiceClient {
  GetReadingPreferences(data: {
    userId: string;
  }): Observable<GrpcResponse<any>>;
  UpdateReadingPreferences(data: {
    userId: string;
    fontSize?: number;
    backgroundColor?: string;
    textColor?: string;
    lineHeight?: number;
    fontFamily?: string;
    readingMode?: string;
    autoHideControls?: boolean;
    brightness?: number;
    pageTurnAnimation?: boolean;
  }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class ReadingPreferencesService implements OnModuleInit {
  private usersService!: UsersServiceClient;

  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.usersClient.getService<UsersServiceClient>("UsersService");
  }

  getReadingPreferences(userId: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetReadingPreferences({ userId: String(userId) }),
      "Failed to load reading preferences",
    );
  }

  updateReadingPreferences(userId: number, dto: Record<string, any>) {
    return getGrpcDataOrThrow(
      this.usersService.UpdateReadingPreferences({
        userId: String(userId),
        ...dto,
      }),
      "Failed to update reading preferences",
    );
  }
}















