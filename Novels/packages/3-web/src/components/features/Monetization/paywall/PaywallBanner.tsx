// Paywall Banner component
"use client";

import React from "react";
import { useCheckPaywall, usePurchaseChapter } from "@/lib/hooks/monetization/usePaywall";
import { Button } from "@/components/ui/button";
import { WalletBalance } from "../wallet/WalletBalance";

interface PaywallBannerProps {
  storyId: string;
  chapterId: string;
  chapterPrice?: number;
}

export const PaywallBanner: React.FC<PaywallBannerProps> = ({
  storyId,
  chapterId,
  chapterPrice,
}) => {
  const { data: paywallInfo, isLoading } = useCheckPaywall(storyId);
  const purchaseChapter = usePurchaseChapter();

  if (isLoading) {
    return <div>Checking access...</div>;
  }

  if (!paywallInfo?.requiresPurchase) {
    return null;
  }

  const handlePurchase = async () => {
    try {
      await purchaseChapter.mutateAsync(chapterId);
    } catch (error) {
      console.error("Failed to purchase chapter:", error);
    }
  };

  return (
    <div className="border-2 border-primary rounded-lg p-6 text-center space-y-4">
      <div>
        <h3 className="text-xl font-bold mb-2">This Chapter Requires Purchase</h3>
        <p className="text-muted-foreground">
          Unlock this chapter to continue reading
        </p>
      </div>

      {chapterPrice && (
        <div className="text-2xl font-bold">
          {chapterPrice} <span className="text-lg font-normal text-muted-foreground">points</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <WalletBalance />
      </div>

      <Button
        onClick={handlePurchase}
        disabled={purchaseChapter.isPending}
        size="lg"
        className="w-full"
      >
        {purchaseChapter.isPending ? "Processing..." : "Purchase Chapter"}
      </Button>
    </div>
  );
};

