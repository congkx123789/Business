"use client";

import React from "react";
import { TransactionHistory } from "@/components/features/Monetization/wallet/TransactionHistory";

export default function WalletTransactionsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <p className="text-xs uppercase text-muted-foreground">Wallet</p>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-sm text-muted-foreground">
          Detailed record of your point top ups and purchases.
        </p>
      </div>
      <TransactionHistory />
    </div>
  );
}

