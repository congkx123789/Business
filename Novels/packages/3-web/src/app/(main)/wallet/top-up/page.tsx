"use client";

import React, { useState } from "react";
import { TopUpDialog } from "@/components/features/Monetization/wallet/TopUpDialog";
import { Button } from "@/components/ui/button";
import { PointsDisplay } from "@/components/features/Monetization/wallet/PointsDisplay";
import { useWalletBalance } from "@/lib/hooks/monetization/useWallet";

export default function WalletTopUpPage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const { data: balance } = useWalletBalance();

  return (
    <div className="container py-8 space-y-6">
      <div>
        <p className="text-xs uppercase text-muted-foreground">Wallet</p>
        <h1 className="text-3xl font-bold">Top Up</h1>
        <p className="text-sm text-muted-foreground">
          Add points to your wallet to purchase chapters, privilege, and subscriptions.
        </p>
      </div>
      <PointsDisplay balance={balance?.balance ?? 0} />
      <Button onClick={() => setDialogOpen(true)}>Open Top Up Dialog</Button>
      <TopUpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

