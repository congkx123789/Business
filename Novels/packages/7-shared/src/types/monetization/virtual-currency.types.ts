// Virtual Currency types

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // In points (1 point = 1/100 CNY)
  totalEarned: number;
  totalSpent: number;
  currency: 'points' | 'coins';
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'earn' | 'spend' | 'top-up' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string; // Reference to purchase, mission, etc.
  createdAt: Date;
}

