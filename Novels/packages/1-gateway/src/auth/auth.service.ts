import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { ConfigService } from "@nestjs/config";
import type { User } from "7-shared";
import { hashPassword, verifyPassword } from "../common/utils/password.util";
import { GrpcResponse } from "../common/types/grpc.types";
import { getGrpcResponse } from "../common/utils/grpc.util";
import { getErrorMessage } from "../common/utils/error.util";

type UserWithSensitiveFields = User & { password?: string };

interface UsersServiceClient {
  getUserByEmail(data: { email: string }): Observable<GrpcResponse<UserWithSensitiveFields>>;
  createUser(data: {
    email: string;
    password: string;
    username?: string;
  }): Observable<GrpcResponse<User>>;
}

@Injectable()
export class AuthService {
  private readonly usersService: UsersServiceClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject("USERS_SERVICE") private readonly usersClient: ClientGrpc
  ) {
    this.usersService = this.usersClient.getService<UsersServiceClient>("UsersService");
  }

  async register(dto: { email: string; password: string; username?: string }) {
    try {
      const hashedPassword = await hashPassword(dto.password);

      const result = await getGrpcResponse(
        this.usersService.createUser({
          email: dto.email,
          password: hashedPassword,
          username: dto.username,
        })
      );

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to create user");
      }

      const tokens = await this.generateTokens(result.data.id, result.data.email);

      return {
        user: result.data,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException(getErrorMessage(error, "Registration failed"));
    }
  }

  async login(dto: { email: string; password: string }) {
    try {
      const result = await getGrpcResponse(this.usersService.getUserByEmail({ email: dto.email }));

      if (!result.success || !result.data) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isValid = await verifyPassword(dto.password, result.data.password ?? "");
      if (!isValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const tokens = await this.generateTokens(result.data.id, result.data.email);
      const { password, ...user } = result.data;

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException(getErrorMessage(error, "Login failed"));
    }
  }

  async refresh(dto: { refreshToken: string }) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken);
      const tokens = await this.generateTokens(payload.sub, payload.email);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException(getErrorMessage(error, "Invalid refresh token"));
    }
  }

  private async generateTokens(userId: string | number, email: string) {
    const payload = { sub: String(userId), email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("jwt.accessTokenTtl", "15m"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("jwt.refreshTokenTtl", "7d"),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

