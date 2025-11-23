import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  getGrpcDataOrThrow,
  getGrpcResultOrThrow,
} from "../../common/utils/grpc.util";

interface MonetizationGrpcClient {
  getWallet(data: { userId: string }): Observable<any>;
  topUp(data: { userId: string; amount: number }): Observable<any>;
  getTransactions(data: { userId: string; page?: number; limit?: number }): Observable<any>;
  purchaseChapter(data: { userId: string; chapterId: string }): Observable<any>;
  purchaseBulk(data: { userId: string; chapterIds: string[] }): Observable<any>;
  getPurchaseHistory(data: { userId: string; page?: number; limit?: number }): Observable<any>;
  getChapterPrice(data: { chapterId: string }): Observable<any>;
  purchasePrivilege(data: { userId: string; storyId: string }): Observable<any>;
  checkPrivilege(data: { userId: string; storyId: string }): Observable<any>;
  getAdvancedChapters(data: { storyId: string; userId?: string }): Observable<any>;
  createMembership(data: { userId: string; planId: string }): Observable<any>;
  getMembership(data: { userId: string }): Observable<any>;
  claimDailyBonus(data: { userId: string }): Observable<any>;
  cancelMembership(data: { userId: string }): Observable<any>;
  purchaseSubscription(data: { userId: string; planId: string; autoRenew?: boolean }): Observable<any>;
  getSubscription(data: { userId: string }): Observable<any>;
}

@Injectable()
export class MonetizationService implements OnModuleInit {
  private client!: MonetizationGrpcClient;

  constructor(@Inject("MONETIZATION_SERVICE") private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.client = this.grpcClient.getService<MonetizationGrpcClient>("MonetizationService");
  }

  getWallet(userId: string) {
    return getGrpcDataOrThrow(this.client.getWallet({ userId }), "Failed to load wallet");
  }

  topUp(userId: string, amount: number) {
    return getGrpcDataOrThrow(this.client.topUp({ userId, amount }), "Failed to top-up wallet");
  }

  getTransactions(userId: string, page?: number, limit?: number) {
    return getGrpcResultOrThrow(
      this.client.getTransactions({ userId, page, limit }),
      "Failed to load transactions",
    );
  }

  purchaseChapter(userId: string, chapterId: string) {
    return getGrpcDataOrThrow(
      this.client.purchaseChapter({ userId, chapterId }),
      "Failed to purchase chapter",
    );
  }

  purchaseBulk(userId: string, chapterIds: string[]) {
    return getGrpcDataOrThrow(
      this.client.purchaseBulk({ userId, chapterIds }),
      "Failed to complete bulk purchase",
    );
  }

  getPurchaseHistory(userId: string, page?: number, limit?: number) {
    return getGrpcResultOrThrow(
      this.client.getPurchaseHistory({ userId, page, limit }),
      "Failed to load purchase history",
    );
  }

  getChapterPrice(chapterId: string) {
    return getGrpcDataOrThrow(
      this.client.getChapterPrice({ chapterId }),
      "Failed to load chapter price",
    );
  }

  purchasePrivilege(userId: string, storyId: string) {
    return getGrpcDataOrThrow(
      this.client.purchasePrivilege({ userId, storyId }),
      "Failed to purchase privilege",
    );
  }

  checkPrivilege(userId: string, storyId: string) {
    return getGrpcDataOrThrow(
      this.client.checkPrivilege({ userId, storyId }),
      "Failed to check privilege",
    );
  }

  getAdvancedChapters(storyId: string, userId?: string) {
    return getGrpcResultOrThrow(
      this.client.getAdvancedChapters({ storyId, userId }),
      "Failed to load advanced chapters",
    );
  }

  createMembership(userId: string, planId: string) {
    return getGrpcDataOrThrow(
      this.client.createMembership({ userId, planId }),
      "Failed to create membership",
    );
  }

  getMembership(userId: string) {
    return getGrpcDataOrThrow(
      this.client.getMembership({ userId }),
      "Failed to load membership",
    );
  }

  claimDailyBonus(userId: string) {
    return getGrpcDataOrThrow(
      this.client.claimDailyBonus({ userId }),
      "Failed to claim membership bonus",
    );
  }

  cancelMembership(userId: string) {
    return getGrpcDataOrThrow(
      this.client.cancelMembership({ userId }),
      "Failed to cancel membership",
    );
  }

  purchaseSubscription(userId: string, planId: string, autoRenew?: boolean) {
    return getGrpcDataOrThrow(
      this.client.purchaseSubscription({ userId, planId, autoRenew }),
      "Failed to purchase subscription",
    );
  }

  getSubscription(userId: string) {
    return getGrpcDataOrThrow(
      this.client.getSubscription({ userId }),
      "Failed to load subscription",
    );
  }
}

