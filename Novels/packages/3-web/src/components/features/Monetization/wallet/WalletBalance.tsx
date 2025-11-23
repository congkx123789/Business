// Wallet Balance component
"use client";

import React from "react";
import { useWalletBalance } from "@/lib/hooks/monetization/useWallet";

export const WalletBalance: React.FC = () => {
  const { data: balance, isLoading } = useWalletBalance();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading balance...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Balance:</span>
      <span className="text-lg font-bold">
        {balance?.balance || 0} <span className="text-sm font-normal text-muted-foreground">points</span>
      </span>
    </div>
  );
};

