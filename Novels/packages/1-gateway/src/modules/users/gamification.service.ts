import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import {
  getGrpcDataOrThrow,
  getGrpcResultOrThrow,
} from "../../common/utils/grpc.util";

interface UsersGamificationClient {
  GetDailyMissions(data: {
    userId: string;
  }): Observable<GrpcResponse<any>>;
  ClaimMission(data: {
    userId: string;
    missionId: string;
  }): Observable<GrpcResponse<any>>;
  GetPowerStones(data: {
    userId: string;
  }): Observable<GrpcResponse<any>>;
  GetFastPasses(data: {
    userId: string;
  }): Observable<GrpcResponse<any>>;
  UseFastPass(data: {
    userId: string;
    storyId: string;
  }): Observable<GrpcResponse<any>>;
  ExchangePoints(data: {
    userId: string;
    amount: number;
  }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class GamificationService implements OnModuleInit {
  private gamificationClient!: UsersGamificationClient;

  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.gamificationClient =
      this.usersClient.getService<UsersGamificationClient>("UsersService");
  }

  getDailyMissions(userId: string) {
    return getGrpcDataOrThrow(
      this.gamificationClient.GetDailyMissions({ userId }),
      "Failed to load daily missions",
    );
  }

  claimDailyMission(userId: string, missionId: string) {
    return getGrpcDataOrThrow(
      this.gamificationClient.ClaimMission({ userId, missionId }),
      "Failed to claim mission",
    );
  }

  getPowerStones(userId: string) {
    return getGrpcDataOrThrow(
      this.gamificationClient.GetPowerStones({ userId }),
      "Failed to load Power Stones",
    );
  }

  getFastPasses(userId: string) {
    return getGrpcDataOrThrow(
      this.gamificationClient.GetFastPasses({ userId }),
      "Failed to load Fast Passes",
    );
  }

  useFastPass(userId: string, storyId: string) {
    return getGrpcDataOrThrow(
      this.gamificationClient.UseFastPass({ userId, storyId }),
      "Failed to use Fast Pass",
    );
  }

  exchangePoints(userId: string, amount: number) {
    return getGrpcResultOrThrow(
      this.gamificationClient.ExchangePoints({ userId, amount }),
      "Failed to exchange points",
    );
  }
}


