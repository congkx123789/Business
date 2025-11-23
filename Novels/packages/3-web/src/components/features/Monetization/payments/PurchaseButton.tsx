"use client";

import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { usePurchaseChapter } from "@/lib/hooks/monetization/usePaywall";

interface PurchaseButtonProps extends ButtonProps {
  chapterId: string;
  onSuccess?: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ chapterId, onSuccess, ...props }) => {
  const purchaseChapter = usePurchaseChapter();

  const handleClick = async () => {
    await purchaseChapter.mutateAsync(chapterId);
    onSuccess?.();
  };

  return (
    <Button onClick={handleClick} disabled={purchaseChapter.isPending} {...props}>
      {purchaseChapter.isPending ? "Purchasing..." : props.children ?? "Purchase"}
    </Button>
  );
};

