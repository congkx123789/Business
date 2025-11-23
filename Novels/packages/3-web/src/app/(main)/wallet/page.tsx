// Wallet dashboard page
"use client";

import React, { useState } from "react";
import { useWalletBalance } from "@/lib/hooks/monetization/useWallet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PointsDisplay } from "@/components/features/Monetization/wallet/PointsDisplay";
import { TransactionHistory } from "@/components/features/Monetization/wallet/TransactionHistory";
import { TopUpDialog } from "@/components/features/Monetization/wallet/TopUpDialog";

export default function WalletPage() {
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const [topUpOpen, setTopUpOpen] = useState(false);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Monetization</p>
          <h1 className="text-3xl font-bold">Wallet</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTopUpOpen(true)}>Top Up</Button>
          <Link href="/wallet/transactions">
            <Button variant="outline">Transactions</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {balanceLoading ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Loading balance...
          </div>
        ) : (
          <PointsDisplay balance={balance?.balance ?? 0} />
        )}
        <div className="rounded-xl border border-border/60 bg-card/70 p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Links</h2>
          <p className="text-sm text-muted-foreground">
            Manage top ups, review your purchase history, and keep track of points.
          </p>
          <div className="mt-4 grid gap-2">
            <Link href="/wallet/top-up" className="text-sm text-primary hover:underline">
              Go to Top Up page →
            </Link>
            <Link href="/wallet/transactions" className="text-sm text-primary hover:underline">
              View full transaction history →
            </Link>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link href="/wallet/transactions" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        <TransactionHistory limit={8} />
      </section>

      <TopUpDialog open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </div>
  );
}

