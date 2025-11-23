import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { BalanceResponseDto } from "./dto/balance-response.dto";
import { TopUpRequestDto } from "./dto/top-up-request.dto";
import { DeductPointsDto } from "./dto/deduct-points.dto";
import { TransactionHistoryQueryDto } from "./dto/transaction-history-query.dto";
import { WalletService, WalletSnapshot } from "./wallet.service";
import { MonetizationEventsService } from "../../common/queue/monetization-events.service";

@Injectable()
export class VirtualCurrencyService {
  private readonly logger = new Logger(VirtualCurrencyService.name);
  private readonly transactionLocks = new Set<string>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly walletService: WalletService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly eventsService: MonetizationEventsService
  ) {}

  async getWallet(userId: string): Promise<WalletSnapshot> {
    return await this.walletService.findOrCreateWallet(userId);
  }

  async getBalance(userId: string): Promise<BalanceResponseDto> {
    const cacheKey = `wallet:${userId}`;
    
    // Try to get from Redis cache
    const cached = await this.cacheManager.get<{ balance: number; updatedAt: string }>(cacheKey);
    if (cached) {
      return {
        userId,
        balance: cached.balance,
        currency: "points",
        updatedAt: cached.updatedAt,
        cached: true,
      };
    }

    // Get from database
    const wallet = await this.walletService.findOrCreateWallet(userId);
    
    // Cache in Redis
    await this.cacheManager.set(
      cacheKey,
      { balance: wallet.balance, updatedAt: wallet.updatedAt },
      this.CACHE_TTL
    );

    return {
      userId,
      balance: wallet.balance,
      currency: wallet.currency,
      updatedAt: wallet.updatedAt,
      cached: false,
    };
  }

  async getTransactionHistory(query: TransactionHistoryQueryDto) {
    return this.walletService.getTransactionHistory(query);
  }

  async topUp(request: TopUpRequestDto) {
    const lockKey =
      request.transactionId ?? `${request.userId}:${request.amount}:${request.paymentMethod}`;
    if (this.transactionLocks.has(lockKey)) {
      this.logger.warn(`Duplicate top-up detected for ${lockKey}`);
      const wallet = await this.walletService.findOrCreateWallet(request.userId);
      return {
        success: false,
        duplicate: true,
        wallet,
        message: "Duplicate top-up ignored",
      };
    }

    this.transactionLocks.add(lockKey);
    try {
      const { wallet, transactionId } = await this.walletService.applyTopUp(request);
      
      // Invalidate cache
      await this.cacheManager.del(`wallet:${request.userId}`);
      
      // Emit event
      await this.eventsService.emitWalletTopUpCompleted({
        userId: request.userId,
        amount: request.amount,
        pointsAwarded: request.amount,
        transactionId,
      });

      // Emit balance updated event
      await this.eventsService.emitWalletBalanceUpdated({
        userId: request.userId,
        balance: wallet.balance,
        previousBalance: wallet.balance - request.amount,
      });

      return {
        success: true,
        wallet,
        transactionId,
        message: "Top-up successful",
      };
    } finally {
      this.transactionLocks.delete(lockKey);
    }
  }

  async deductPoints(request: DeductPointsDto) {
    try {
      const previousWallet = await this.walletService.findOrCreateWallet(request.userId);
      const wallet = await this.walletService.applyDeduction(request);
      
      // Invalidate cache
      await this.cacheManager.del(`wallet:${request.userId}`);
      
      // Emit balance updated event
      await this.eventsService.emitWalletBalanceUpdated({
        userId: request.userId,
        balance: wallet.balance,
        previousBalance: previousWallet.balance,
      });

      // Check for low balance (threshold: 100 points)
      if (wallet.balance < 100) {
        await this.eventsService.emitWalletLowBalance({
          userId: request.userId,
          balance: wallet.balance,
          threshold: 100,
        });
      }

      return {
        success: true,
        wallet,
        message: "Points deducted",
      };
    } catch (error) {
      if ((error as Error).message === "INSUFFICIENT_FUNDS") {
        return {
          success: false,
          wallet: await this.walletService.findOrCreateWallet(request.userId),
          message: "Insufficient balance",
        };
      }

      this.logger.error("Failed to deduct points", error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async refundPoints(request: DeductPointsDto) {
    const previousWallet = await this.walletService.findOrCreateWallet(request.userId);
    const wallet = await this.walletService.applyRefund(request);
    
    // Invalidate cache
    await this.cacheManager.del(`wallet:${request.userId}`);
    
    // Emit balance updated event
    await this.eventsService.emitWalletBalanceUpdated({
      userId: request.userId,
      balance: wallet.balance,
      previousBalance: previousWallet.balance,
    });

    return {
      success: true,
      wallet,
      message: "Points refunded",
    };
  }
}


