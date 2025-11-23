import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DatabaseService } from "../../common/database/database.service";
import { TopUpRequestDto } from "./dto/top-up-request.dto";
import { DeductPointsDto } from "./dto/deduct-points.dto";
import { TransactionHistoryQueryDto } from "./dto/transaction-history-query.dto";
import { Prisma, TransactionType } from "@prisma/monetization-service-client";

export interface WalletSnapshot {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  currency: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: "topup" | "purchase" | "refund" | "reward" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

@Injectable()
export class WalletService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOrCreateWallet(userId: string): Promise<WalletSnapshot> {
    let wallet = await this.databaseService.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.databaseService.wallet.create({
        data: {
          userId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          currency: "points",
        },
      });
    }

    return {
      userId: wallet.userId,
      balance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalSpent: Number(wallet.totalSpent),
      currency: wallet.currency,
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }

  async applyTopUp(
    request: TopUpRequestDto
  ): Promise<{ wallet: WalletSnapshot; transactionId: string }> {
    const transactionId = request.transactionId ?? randomUUID();
    
    // Use Prisma transaction for atomicity
    const result = await this.databaseService.$transaction(async (tx) => {
      // Find or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: request.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: request.userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            currency: "points",
          },
        });
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + request.amount;

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalEarned: {
            increment: request.amount,
          },
        },
      });

      // Create currency transaction
      await tx.currencyTransaction.create({
        data: {
          walletId: wallet.id,
          userId: request.userId,
          type: TransactionType.TOPUP,
          amount: request.amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          description: `Top-up via ${request.paymentMethod}`,
          referenceId: transactionId,
        },
      });

      // Create top-up record
      await tx.topUp.create({
        data: {
          userId: request.userId,
          walletId: wallet.id,
          amount: request.amount,
          currency: request.currency ?? "CNY",
          pointsAwarded: request.amount,
          exchangeRate: 100, // 1 point = 1/100 CNY
          paymentMethod: request.paymentMethod,
          paymentId: transactionId,
          status: "completed",
          completedAt: new Date(),
        },
      });

      return {
        wallet: {
          userId: updatedWallet.userId,
          balance: Number(updatedWallet.balance),
          totalEarned: Number(updatedWallet.totalEarned),
          totalSpent: Number(updatedWallet.totalSpent),
          currency: updatedWallet.currency,
          updatedAt: updatedWallet.updatedAt.toISOString(),
        },
        transactionId,
      };
    });

    return result;
  }

  async applyDeduction(request: DeductPointsDto): Promise<WalletSnapshot> {
    const result = await this.databaseService.$transaction(async (tx) => {
      // Find or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: request.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: request.userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            currency: "points",
          },
        });
      }

      const balanceBefore = Number(wallet.balance);
      
      if (balanceBefore < request.amount) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const balanceAfter = balanceBefore - request.amount;

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalSpent: {
            increment: request.amount,
          },
        },
      });

      // Create currency transaction
      await tx.currencyTransaction.create({
        data: {
          walletId: wallet.id,
          userId: request.userId,
          type: TransactionType.DEDUCTION,
          amount: -request.amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          description: request.description ?? "Deducted for purchase",
          referenceId: request.referenceId,
        },
      });

      return {
        userId: updatedWallet.userId,
        balance: Number(updatedWallet.balance),
        totalEarned: Number(updatedWallet.totalEarned),
        totalSpent: Number(updatedWallet.totalSpent),
        currency: updatedWallet.currency,
        updatedAt: updatedWallet.updatedAt.toISOString(),
      };
    });

    return result;
  }

  async applyRefund(request: DeductPointsDto): Promise<WalletSnapshot> {
    const result = await this.databaseService.$transaction(async (tx) => {
      // Find or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: request.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: request.userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            currency: "points",
          },
        });
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + request.amount;

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalEarned: {
            increment: request.amount,
          },
        },
      });

      // Create currency transaction
      await tx.currencyTransaction.create({
        data: {
          walletId: wallet.id,
          userId: request.userId,
          type: TransactionType.REFUND,
          amount: request.amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          description: request.description ?? "Refund processed",
          referenceId: request.referenceId,
        },
      });

      return {
        userId: updatedWallet.userId,
        balance: Number(updatedWallet.balance),
        totalEarned: Number(updatedWallet.totalEarned),
        totalSpent: Number(updatedWallet.totalSpent),
        currency: updatedWallet.currency,
        updatedAt: updatedWallet.updatedAt.toISOString(),
      };
    });

    return result;
  }

  async getTransactionHistory(query: TransactionHistoryQueryDto) {
    const { userId, page = 1, limit = 20, types } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.CurrencyTransactionWhereInput = {
      userId,
    };

    if (types && types.length > 0) {
      const typeMap: Record<string, TransactionType> = {
        topup: TransactionType.TOPUP,
        purchase: TransactionType.PURCHASE,
        refund: TransactionType.REFUND,
        reward: TransactionType.REWARD,
      };
      where.type = {
        in: types.map((t) => typeMap[t] ?? TransactionType.PURCHASE),
      };
    }

    const [data, total] = await Promise.all([
      this.databaseService.currencyTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.databaseService.currencyTransaction.count({ where }),
    ]);

    return {
      data: data.map((tx) => ({
        id: tx.id,
        userId: tx.userId,
        type: tx.type.toLowerCase() as TransactionRecord["type"],
        amount: Number(tx.amount),
        balanceBefore: Number(tx.balanceBefore),
        balanceAfter: Number(tx.balanceAfter),
        referenceId: tx.referenceId ?? undefined,
        description: tx.description ?? undefined,
        createdAt: tx.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}


