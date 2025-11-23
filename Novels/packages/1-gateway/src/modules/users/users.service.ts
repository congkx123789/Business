import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import type { User } from "7-shared";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcDataOrThrow } from "../../common/utils/grpc.util";

interface UsersServiceClient {
  GetUserById(data: { id: number }): Observable<GrpcResponse<User>>;
  UpdateUser(data: {
    id: number;
    email?: string;
    username?: string;
  }): Observable<GrpcResponse<User>>;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService!: UsersServiceClient;

  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.usersClient.getService<UsersServiceClient>("UsersService");
  }

  getProfile(userId: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetUserById({ id: userId }),
      "Failed to load profile",
    );
  }

  getUserById(userId: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetUserById({ id: userId }),
      "Failed to load user",
    );
  }

  updateProfile(userId: number, dto: { email?: string; username?: string }) {
    return getGrpcDataOrThrow(
      this.usersService.UpdateUser({
        id: userId,
        email: dto.email,
        username: dto.username,
      }),
      "Failed to update profile",
    );
  }
}

