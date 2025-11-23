"use client";

import React from "react";
import { useTransactions } from "@/lib/hooks/monetization/useWallet";

interface TransactionHistoryProps {
  limit?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ limit = 20 }) => {
  const { data: transactions, isLoading } = useTransactions({ limit });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Loading transactions...
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx: any) => (
        <div key={tx.id} className="rounded-xl border border-border/60 bg-card/70 px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{new Date(tx.date).toLocaleString()}</span>
            <span className={tx.amount > 0 ? "text-emerald-500" : "text-rose-400"}>
              {tx.amount > 0 ? "+" : ""}
              {tx.amount} pts
            </span>
          </div>
          <p className="text-sm text-foreground">{tx.type}</p>
          {tx.description && <p className="text-xs text-muted-foreground">{tx.description}</p>}
        </div>
      ))}
    </div>
  );
};

