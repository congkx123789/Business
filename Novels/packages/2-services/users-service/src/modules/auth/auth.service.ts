import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../common/database/database.service";
import * as bcrypt from "bcrypt";

export interface JwtPayload {
  sub: number; // user id
  email: string;
  username?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: DatabaseService
  ) {}

  /**
   * Validates user credentials and returns user if valid
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Creates JWT access and refresh tokens for a user
   */
  async createTokens(userId: number, email: string, username?: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      username,
    };

    const accessTokenTtl = this.configService.get<string>("jwt.accessTokenTtl", "15m");
    const refreshTokenTtl = this.configService.get<string>("jwt.refreshTokenTtl", "7d");

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenTtl,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshTokenTtl,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validates a JWT token and returns the payload
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Refreshes an access token using a refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const payload = await this.validateToken(refreshToken);
    
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const accessTokenTtl = this.configService.get<string>("jwt.accessTokenTtl", "15m");
    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username ?? undefined,
    };

    return this.jwtService.signAsync(newPayload, {
      expiresIn: accessTokenTtl,
    });
  }

  /**
   * Hashes a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}

